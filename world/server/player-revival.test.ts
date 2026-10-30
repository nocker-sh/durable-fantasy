import { afterEach, expect, it, vi } from "vitest"
import { Player } from "../../durable-objects/player"
import { initialPlayerRecord } from "#/world/server/initial-player-record"
import type { PlayerRecord } from "#/world/server/player-record"
import { durableStorage } from "../test/durable-storage"
import { player } from "#/world/test/player"
vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }))
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})
function fixture() {
  vi.useFakeTimers()
  vi.setSystemTime(1000)
  const p = player({ hp: 0, exp: 100, level: 10, sitting: true })
  const location = { world: 2, map: "south-meadow", route: [[30, 50]], since: 1000, connection: "connection" }
  const store = durableStorage({ ...initialPlayerRecord(), player: p, location }, 8)
  let actor = new Player.class(store.state, {})
  return {
    p,
    store,
    get actor() {
      return actor
    },
    restart: () => {
      actor = new Player.class(store.state, {})
    },
    record: () => (store.saved.get("__void_durable_state") as { value: PlayerRecord }).value,
  }
}
it("saves recovered HP, death penalty, life and home position together before replying", async () => {
  const f = fixture()
  const result = await f.actor.reviveAtHome("connection")
  if (!result.ok) throw Error(result.reason)
  expect(result.state.hp).toBeGreaterThan(0)
  expect(result.state.exp).toBeLessThan(f.p.exp)
  expect(result.state.sitting).toBe(false)
  expect(f.record()).toMatchObject({ combatLife: 1, deliveryRevision: 1, player: result.state, location: { world: 2, map: f.p.savePoint.map, route: [f.p.savePoint.cell], connection: null } })
  f.restart()
  expect(await f.actor.reviveAtHome("connection")).toEqual({ ok: false, reason: "NOT_READY" })
  expect(f.record().combatLife).toBe(1)
  expect(f.record().player.exp).toBe(result.state.exp)
  expect(await f.actor.arrive({ world: 2, map: "south-meadow", connection: "new-connection" })).toEqual({ map: f.p.savePoint.map, at: f.p.savePoint.cell, accepted: false })
})
it("rolls back health, life and location if the joint save fails, then permits a retry", async () => {
  const f = fixture(),
    before = structuredClone(f.store.saved.get("__void_durable_state"))
  f.store.failNextSave()
  await expect(f.actor.reviveAtHome("connection")).rejects.toThrow("Storage unavailable")
  expect(f.store.saved.get("__void_durable_state")).toEqual(before)
  f.restart()
  expect((await f.actor.reviveAtHome("connection")).ok).toBe(true)
  expect(f.record().combatLife).toBe(1)
})
it("refuses an unowned connection or living player without changing the saved location", async () => {
  const f = fixture(),
    before = structuredClone(f.store.saved.get("__void_durable_state"))
  expect(await f.actor.reviveAtHome("other")).toEqual({ ok: false, reason: "NOT_READY" })
  expect(f.store.saved.get("__void_durable_state")).toEqual(before)
  await f.actor.reviveAtHome("connection")
  await f.actor.arrive({ world: 2, map: f.p.savePoint.map, connection: "new-connection" })
  const alive = structuredClone(f.store.saved.get("__void_durable_state"))
  expect(await f.actor.reviveAtHome("new-connection")).toEqual({ ok: false, reason: "NOT_FALLEN" })
  expect(f.store.saved.get("__void_durable_state")).toEqual(alive)
})
