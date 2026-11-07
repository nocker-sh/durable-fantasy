import { afterEach, expect, it, vi } from "vitest"
import { Player } from "#/durable-objects/player"
import { ERRANDS } from "#/world/core/errands"
import { errandToday } from "#/world/core/errand-today"
import { dayOf } from "#/world/core/day-of"
import { countItem } from "#/world/core/count-item"
import { FRIEND } from "#/world/core/friendship-rules"
import { initialPlayerRecord } from "#/world/server/initial-player-record"
import { durableStorage } from "#/world/test/durable-storage"
import { bagWith } from "#/world/test/bag-with"

vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }))
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

it.each(ERRANDS)("$id: acceptance and handover remain atomic across failed writes and restarts", async (errand) => {
  const first = Date.parse("2026-10-20T21:00:00Z")
  const now = Array.from({ length: 400 }, (_, day) => first + day * 86_400_000).find((at) => errandToday(errand.from, dayOf(at))?.id === errand.id)
  expect(now, `No daily offer for ${errand.id}`).toBeDefined()
  vi.useFakeTimers()
  vi.setSystemTime(now!)
  const initial = initialPlayerRecord()
  // Initial materials and a daily-offer time are local conditions, not a walking or gathering route.
  if (errand.kind === "bring") initial.player = { ...initial.player, bag: bagWith([errand.wants.item, errand.wants.count + 1]) }
  const store = durableStorage(initial, 8)
  let actor = new Player.class(store.state, {})
  const original = structuredClone(store.saved.get("__void_durable_state"))
  const take = { type: "errand-take" as const, errand: errand.id, from: errand.from }
  store.failNextSave()
  await expect(actor.run(take)).rejects.toThrow("Storage unavailable")
  expect(store.saved.get("__void_durable_state")).toEqual(original)
  actor = new Player.class(store.state, {})
  const accepted = await actor.run(take)
  if (!accepted.ok) throw new Error(accepted.reason)
  expect(accepted.state.errands).toEqual([{ id: errand.id, day: dayOf(now!), done: false }])
  expect(accepted.state.bag).toEqual(initial.player.bag)
  expect(accepted.state.gold).toBe(initial.player.gold)
  expect(accepted.state.friends).toEqual({})
  const waiting = structuredClone(store.saved.get("__void_durable_state"))
  actor = new Player.class(store.state, {})
  expect(await actor.run(take)).toEqual({ ok: false, reason: "NO_ERRAND" })
  expect(store.saved.get("__void_durable_state")).toEqual(waiting)
  const hand = { type: "errand-hand" as const, errand: errand.id, to: errand.kind === "bring" ? errand.from : errand.to }
  store.failNextSave()
  await expect(actor.run(hand)).rejects.toThrow("Storage unavailable")
  expect(store.saved.get("__void_durable_state")).toEqual(waiting)
  actor = new Player.class(store.state, {})
  const handed = await actor.run(hand)
  if (!handed.ok) throw new Error(handed.reason)
  expect(handed.state.gold).toBe(initial.player.gold + errand.gold)
  expect(handed.state.errands).toEqual([{ id: errand.id, day: dayOf(now!), done: true }])
  expect(handed.state.friends).toEqual(errand.kind === "bring" ? { [errand.from]: FRIEND.bring } : { [errand.from]: FRIEND.deliver, [errand.to]: FRIEND.received })
  if (errand.kind === "bring") expect(countItem(handed.state.bag, errand.wants.item)).toBe(1)
  else expect(handed.state.bag).toEqual(initial.player.bag)
  const paid = structuredClone(store.saved.get("__void_durable_state"))
  actor = new Player.class(store.state, {})
  expect(await actor.run(hand)).toEqual({ ok: false, reason: "NO_ERRAND" })
  expect(await actor.run(take)).toEqual({ ok: false, reason: "NO_ERRAND" })
  expect(store.saved.get("__void_durable_state")).toEqual(paid)
})
