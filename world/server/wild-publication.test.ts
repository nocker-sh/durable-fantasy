import { afterEach, expect, it, vi } from "vitest"
import { Wild } from "../../durable-objects/wild"
import { Player } from "../../durable-objects/player"
import { initialPlayerRecord } from "#/world/server/initial-player-record"
import { initialWildRecord } from "#/world/server/initial-wild-record"
import type { WildRecord } from "#/world/server/wild-record"
import { emptyWild } from "#/world/core/wild/empty-wild"
import { SPAWNS, MONSTER_KINDS } from "#/world/core/monsters"
import { durableStorage } from "../test/durable-storage"

vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }))
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})
const spawn = SPAWNS.find((s) => s.kind === "slime")!
const hp = MONSTER_KINDS[spawn.kind].hp
async function fixture() {
  vi.useFakeTimers()
  vi.setSystemTime(1000)
  const store = durableStorage({ wild: emptyWild() }, 0)
  const playerStore = durableStorage(initialPlayerRecord(), 6)
  const player = new Player.class(playerStore.state, {})
  vi.spyOn(Player, "get").mockReturnValue(player as unknown as ReturnType<typeof Player.get>)
  let actor = new Wild.class(store.state, {})
  await actor.state(spawn.map)
  return {
    store,
    get actor() {
      return actor
    },
    restart: () => {
      actor = new Wild.class(store.state, {})
    },
    strike: async (damage = 1) => {
      const request = await actor.beginStrike({ target: spawn.id, damage: damage, owner: "hunter", request: "request" })
      if (!request.ok) throw Error(request.reason)
      return { id: request.id, result: await actor.strike("hunter", request.id) }
    },
  }
}
it("numbers snapshots and hits together, while keeping a replay's original hit number", async () => {
  const f = await fixture()
  expect((await f.actor.snapshot(spawn.map)).revision).toBe(1)
  const strike = await f.strike()
  expect(strike.result.revision).toBe(2)
  const after = await f.actor.snapshot(spawn.map)
  expect(after).toMatchObject({ revision: 3, monsters: { [spawn.id]: { hp: hp - 1 } } })
  f.restart()
  expect((await f.actor.strike("hunter", strike.id)).revision).toBe(2)
  expect((await f.actor.snapshot(spawn.map)).revision).toBe(4)
})
it("gives authoritative respawn a later publication than the kill", async () => {
  const f = await fixture()
  const strike = await f.strike(hp)
  const dead = await f.actor.snapshot(spawn.map)
  expect(dead.monsters[spawn.id].hp).toBe(0)
  vi.setSystemTime(dead.monsters[spawn.id].back)
  const alive = await f.actor.snapshot(spawn.map)
  expect(alive.monsters[spawn.id].hp).toBe(hp)
  expect(alive.revision).toBeGreaterThan(dead.revision)
  expect((await f.actor.strike("hunter", strike.id)).revision).toBeLessThan(alive.revision)
})
it("rolls back an unsaved snapshot number and recovers an unsaved hit without publishing it twice", async () => {
  const f = await fixture()
  f.store.failNextSave()
  await expect(f.actor.snapshot(spawn.map)).rejects.toThrow("Storage unavailable")
  f.restart()
  expect((await f.actor.snapshot(spawn.map)).revision).toBe(1)
  const request = await f.actor.beginStrike({ target: spawn.id, damage: 1, owner: "hunter", request: "request" })
  if (!request.ok) throw Error(request.reason)
  f.store.failNextSave()
  await expect(f.actor.strike("hunter", request.id)).rejects.toThrow("Storage unavailable")
  f.restart()
  await f.actor.alarm()
  expect((await f.actor.strike("hunter", request.id)).revision).toBe(2)
  expect((await f.actor.snapshot(spawn.map)).revision).toBe(3)
  expect((await f.actor.state(spawn.map))[spawn.id].hp).toBe(hp - 1)
})
it.each([0, 1, 2, 3])("preserves existing wild data while migrating publication envelope %s", async (version) => {
  const initial = initialWildRecord()
  const { revision: _revision, ...legacy } = initial
  const value = version === 0 ? { wild: initial.wild } : version === 1 ? { wild: initial.wild, serial: 0, jobs: {} } : version === 2 ? legacy : { ...initial, revision: 7 }
  const store = durableStorage(value, version)
  const actor = new Wild.class(store.state, {})
  await actor.state(spawn.map)
  expect(store.saved.get("__void_durable_state")).toEqual({ __voidDurableState: true, version: 3, value: { ...initial, revision: version === 3 ? 7 : 0 } })
})
it("does not overwrite a wild record when its publication counter is exhausted", async () => {
  const store = durableStorage({ ...initialWildRecord(), revision: Number.MAX_SAFE_INTEGER }, 3)
  const before = structuredClone(store.saved.get("__void_durable_state"))
  const actor = new Wild.class(store.state, {})
  await expect(actor.snapshot(spawn.map)).rejects.toThrow("Wild revisions exhausted")
  expect(store.saved.get("__void_durable_state")).toEqual(before)
  expect((store.saved.get("__void_durable_state") as { value: WildRecord }).value.revision).toBe(Number.MAX_SAFE_INTEGER)
})
