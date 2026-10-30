import { afterEach, expect, it, vi } from "vitest"
import { Player } from "../../durable-objects/player"
import { player } from "#/world/test/player"
import { bagWith } from "#/world/test/bag-with"
import { durableStorage } from "../test/durable-storage"
import { initialPlayerRecord } from "#/world/server/initial-player-record"
import type { PlayerState } from "#/world/core/player-types"

vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }))
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})
function fixture(p = player({ hpAt: 1000, spAt: 1000 })) {
  vi.useFakeTimers()
  vi.setSystemTime(1000)
  const store = durableStorage({ ...initialPlayerRecord(), player: p }, 8)
  let actor = new Player.class(store.state, {})
  return {
    store,
    get actor() {
      return actor
    },
    restart: () => {
      actor = new Player.class(store.state, {})
    },
  }
}
function accepted(result: Awaited<ReturnType<InstanceType<typeof Player.class>["run"]>>): PlayerState {
  if (!result.ok) throw Error(result.reason)
  return result.state
}
it("numbers read, command, receipt, grant and reset publications in their persisted order", async () => {
  const f = fixture()
  const revisions: number[] = []
  revisions.push((await f.actor.read()).revision)
  revisions.push(accepted(await f.actor.run({ type: "sit" })).revision)
  const claim = { id: 1, inbox: { gold: 1, items: [] } }
  revisions.push(accepted(await f.actor.receiveInbox(claim)).revision)
  revisions.push(accepted(await f.actor.receiveInbox(claim)).revision)
  revisions.push(accepted(await f.actor.receiveCombat("wild", { id: 1, command: { type: "share", exp: 1, monster: "slime" } })).revision)
  revisions.push((await f.actor.give("herb", 1)).revision)
  f.restart()
  revisions.push((await f.actor.readCombat()).player.revision)
  revisions.push((await f.actor.reset()).revision)
  expect(revisions).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
})
it("starts a supported unnumbered save at the initial publication without losing its data", async () => {
  const base = player({ hpAt: 1000, spAt: 1000 })
  const { revision: _revision, ...old } = base
  const f = fixture(old as PlayerState)
  expect(await f.actor.read()).toEqual({ ...base, revision: 1 })
})
it("does not publish or retain the counter from a failed save", async () => {
  const f = fixture()
  expect((await f.actor.read()).revision).toBe(1)
  f.store.failNextSave()
  await expect(f.actor.run({ type: "sit" })).rejects.toThrow("Storage unavailable")
  f.restart()
  const next = await f.actor.read()
  expect(next.revision).toBe(2)
  expect(next.sitting).toBe(false)
})
it("keeps the saved record intact if its publication counter is exhausted", async () => {
  const f = fixture(player({ revision: Number.MAX_SAFE_INTEGER }))
  const before = structuredClone(f.store.saved.get("__void_durable_state"))
  await expect(f.actor.read()).rejects.toThrow("Player revisions exhausted")
  await expect(f.actor.reset()).rejects.toThrow("Player revisions exhausted")
  expect(f.store.saved.get("__void_durable_state")).toEqual(before)
})
it("numbers the coordinator's local trade commit as well as the peer's commit", async () => {
  const f = fixture()
  const peerStore = durableStorage({ ...initialPlayerRecord(), player: player({ bag: bagWith(["herb", 1]) }) }, 8)
  const peer = new Player.class(peerStore.state, {})
  vi.spyOn(Player, "get").mockReturnValue(peer as unknown as ReturnType<typeof Player.get>)
  const base = { id: "trade", revision: 1, gold: 0 }
  const lot = { item: "herb" as const, count: 1 }
  const local = { ...base, offer: { lots: [], gold: 0 }, outgoing: [], incoming: [lot] }
  const remote = { ...base, offer: { lots: [{ slot: 0, count: 1 }], gold: 0 }, outgoing: [lot], incoming: [] }
  expect((await f.actor.beginTrade({ peer: "peer", local: local, remote: remote })).ok).toBe(true)
  await f.actor.advanceTrade()
  await f.actor.advanceTrade()
  const stored = (f.store.saved.get("__void_durable_state") as { value: { player: PlayerState } }).value.player
  expect(stored.revision).toBe(1)
  expect(stored.bag.find((slot) => slot?.item === "herb")?.count).toBe(1)
  expect((peerStore.saved.get("__void_durable_state") as { value: { player: PlayerState } }).value.player.revision).toBe(1)
})

it("allows an explicit dev reset of an unreadable current payload without resetting its valid publication counter", async () => {
  const f = fixture(player({ revision: 3, gold: -1 }))
  await expect(f.actor.read()).rejects.toThrow("Saved player data is unreadable")
  const reset = await f.actor.reset()
  expect(reset.revision).toBe(4)
  expect(reset.profileComplete).toBe(false)
  expect(reset.gold).toBeGreaterThanOrEqual(0)
})
