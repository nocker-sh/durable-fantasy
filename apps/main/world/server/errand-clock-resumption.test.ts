import { afterEach, expect, it, vi } from "vitest"
import { Player } from "#/durable-objects/player"
import { ERRANDS } from "#/world/core/errands"
import { errandsOn } from "#/world/core/errands-on"
import { errandToday } from "#/world/core/errand-today"
import { dayOf } from "#/world/core/day-of"
import { createGameState } from "#/world/client/initial-state"
import { errandChoices } from "#/world/parts/errand-choices"
import { countItem } from "#/world/core/count-item"
import { initialPlayerRecord } from "#/world/server/initial-player-record"
import type { PlayerRecord } from "#/world/server/player-record"
import { durableStorage } from "#/world/test/durable-storage"
import { bagWith } from "#/world/test/bag-with"
import { errandAskTime } from "#/world/test/errand-ask-time"

vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }))
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})
const day = 86_400_000
const first = Date.parse("2026-10-20T21:00:00Z")
const cases = ERRANDS.flatMap((errand) => [false, true].map((done) => ({ errand, done })))
it.each(cases)("$errand.id, completed=$done: a backward rollover cannot erase a newer errand or repay it", async (props1) => {
  const errand = props1.errand,
    done = props1.done

  const now = Array.from({ length: 400 }, (_, index) => first + index * day).find((at) => errandToday(errand.from, dayOf(at))?.id === errand.id && errandsOn(dayOf(at - 1)).length > 0)
  expect(now).toBeDefined()
  const older = errandsOn(dayOf(now! - 1))[0]
  expect(older).toBeDefined()
  vi.useFakeTimers()
  vi.setSystemTime(now!)
  const initial = initialPlayerRecord()
  initial.player = {
    ...initial.player,
    bag: bagWith(...[errand, older].flatMap((entry) => (entry.kind === "bring" ? [[entry.wants.item, entry.wants.count * 3] as Parameters<typeof bagWith>[number]] : []))),
  }
  const store = durableStorage(initial, 8)
  const record = () => (store.saved.get("__void_durable_state") as { value: PlayerRecord }).value
  const choices = (name: string) => errandChoices({ ...createGameState().get(), player: record().player }, name, Date.now())
  let actor = new Player.class(store.state, {})
  const take = { type: "errand-take" as const, errand: errand.id, from: errand.from }
  const hand = { type: "errand-hand" as const, errand: errand.id, to: errand.kind === "bring" ? errand.from : errand.to }
  expect((await actor.run(take)).ok).toBe(true)
  if (done) expect((await actor.run(hand)).ok).toBe(true)
  const saved = structuredClone(store.saved.get("__void_durable_state"))
  vi.setSystemTime(now! - 1)
  actor = new Player.class(store.state, {})
  const refused = await actor.run({ type: "errand-take", errand: older.id, from: older.from })
  expect(refused).toEqual({ ok: false, reason: "NO_ERRAND" })
  expect(store.saved.get("__void_durable_state")).toEqual(saved)
  expect(choices(older.from)).toEqual([])
  expect(choices(hand.to)).toEqual([])
  expect(await actor.run(hand)).toEqual({ ok: false, reason: "NO_ERRAND" })
  expect(store.saved.get("__void_durable_state")).toEqual(saved)
  vi.setSystemTime(now!)
  actor = new Player.class(store.state, {})
  expect(await actor.run(take)).toEqual({ ok: false, reason: "NO_ERRAND" })
  if (!done) {
    expect(choices(hand.to).some((choice) => choice.action === "errand-hand" && choice.errand === errand.id)).toBe(true)
    expect((await actor.run(hand)).ok).toBe(true)
  } else expect(store.saved.get("__void_durable_state")).toEqual(saved)
  const completed = structuredClone(store.saved.get("__void_durable_state"))
  expect(record().player.gold).toBe(initial.player.gold + errand.gold)
  expect(record().player.errands).toEqual([{ id: errand.id, day: dayOf(now!), done: true }])
  expect(await actor.run(hand)).toEqual({ ok: false, reason: "NO_ERRAND" })
  expect(store.saved.get("__void_durable_state")).toEqual(completed)
  // the next day it is drawn, at an hour its asker asks it
  const next = errandAskTime(errand, now! + day)
  vi.setSystemTime(next)
  actor = new Player.class(store.state, {})
  expect(choices(errand.from).some((choice) => choice.action === "errand-ask" && choice.errand === errand.id)).toBe(true)
  store.failNextSave()
  await expect(actor.run(take)).rejects.toThrow("Storage unavailable")
  expect(store.saved.get("__void_durable_state")).toEqual(completed)
  actor = new Player.class(store.state, {})
  expect((await actor.run(take)).ok).toBe(true)
  expect((await actor.run(hand)).ok).toBe(true)
  expect(record().player.gold).toBe(initial.player.gold + errand.gold * 2)
  if (errand.kind === "bring") expect(countItem(record().player.bag, errand.wants.item)).toBe(countItem(initial.player.bag, errand.wants.item) - errand.wants.count * 2)
})

it("cannot collect a paid delivery twice by taking yesterday's request between identical daily offers", async () => {
  const errand = ERRANDS.find((entry) => entry.kind === "deliver")!
  expect(errand).toBeDefined()
  const now = Array.from({ length: 400 }, (_, index) => first + index * day).find(
    (at) => errandToday(errand.from, dayOf(at))?.id === errand.id && errandsOn(dayOf(at - 1)).some((entry) => entry.id !== errand.id),
  )!
  expect(now).toBeDefined()
  const older = errandsOn(dayOf(now - 1)).find((entry) => entry.id !== errand.id)!
  vi.useFakeTimers()
  vi.setSystemTime(now)
  const initial = initialPlayerRecord()
  const store = durableStorage(initial, 8)
  let actor = new Player.class(store.state, {})
  const take = { type: "errand-take" as const, errand: errand.id, from: errand.from }
  const hand = { type: "errand-hand" as const, errand: errand.id, to: errand.to }
  expect((await actor.run(take)).ok).toBe(true)
  expect((await actor.run(hand)).ok).toBe(true)
  const paid = structuredClone(store.saved.get("__void_durable_state"))
  vi.setSystemTime(now - 1)
  actor = new Player.class(store.state, {})
  await actor.run({ type: "errand-take", errand: older.id, from: older.from })
  vi.setSystemTime(now)
  actor = new Player.class(store.state, {})
  await actor.run(take)
  await actor.run(hand)
  const final = (store.saved.get("__void_durable_state") as { value: PlayerRecord }).value
  expect(final.player.gold).toBe(initial.player.gold + errand.gold)
  expect(store.saved.get("__void_durable_state")).toEqual(paid)
})
