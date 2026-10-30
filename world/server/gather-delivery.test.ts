import { afterEach, expect, it, vi } from "vitest"
import { Nature } from "../../durable-objects/nature"
import { Player } from "../../durable-objects/player"
import { NODES } from "#/world/core/gather"
import { emptyNature } from "#/world/core/nature/empty-nature"
import { leftAt } from "#/world/core/nature/left-at"
import type { GatherRequest } from "#/world/core/gather-receipt-types"
import { initialPlayerRecord } from "#/world/server/initial-player-record"
import type { NatureRecord } from "#/world/server/nature-record-types"
import { player } from "#/world/test/player"
import { durableStorage } from "../test/durable-storage"

vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }))
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})
const now = 1000
const node = NODES[0]
async function fixture() {
  vi.useFakeTimers()
  vi.setSystemTime(now)
  const location = { world: 1, map: node.map, route: [node.cell], since: now, connection: "connection" }
  const playerStore = durableStorage({ ...initialPlayerRecord(), player: player(), location }, 8)
  const natureStore = durableStorage({ nature: emptyNature() }, 0)
  let recipient = new Player.class(playerStore.state, {}),
    source = new Nature.class(natureStore.state, {})
  await source.left(node.map)
  await recipient.read()
  let lost = false
  const receive = vi.fn(async (key: string, request: GatherRequest) => {
    const result = await recipient.receiveGather(key, request)
    if (lost) {
      lost = false
      throw Error("Response lost")
    }
    return result
  })
  const otherStore = durableStorage({ ...initialPlayerRecord(), player: player(), location: { ...location, connection: "other-connection" } }, 8)
  let other = new Player.class(otherStore.state, {})
  const target = { ownsConnection: (id: string) => recipient.ownsConnection(id), receiveGather: receive }
  vi.spyOn(Player, "get").mockImplementation((owner: unknown) => (owner === "owner" ? target : other) as unknown as ReturnType<typeof Player.get>)
  return {
    natureStore,
    playerStore,
    receive,
    get source() {
      return source
    },
    get recipient() {
      return recipient
    },
    get other() {
      return other
    },
    state: () => (natureStore.saved.get("__void_durable_state") as { value: NatureRecord }).value,
    restart: () => {
      source = new Nature.class(natureStore.state, {})
      recipient = new Player.class(playerStore.state, {})
      other = new Player.class(otherStore.state, {})
    },
    loseReply: () => {
      lost = true
    },
    begin: async (seq = 1) => {
      const result = await source.beginGather({ owner: "owner", connection: "connection", seq: seq, node: node.id })
      if (!result.ok) throw Error(result.reason)
      return result.id
    },
  }
}
it("reserves once and replays one item, stamina, skill and tool outcome with the saved random draw", async () => {
  const f = await fixture()
  const random = vi.spyOn(Math, "random").mockReturnValue(0.2)
  const id = await f.begin()
  const request = structuredClone(f.state().jobs.owner.request)
  expect(await f.begin()).toBe(id)
  expect(random).toHaveBeenCalledOnce()
  const first = await f.source.finishGather("owner", id)
  if (!first.ok) throw Error(first.reason)
  f.restart()
  const repeat = await f.source.finishGather("owner", id)
  expect(repeat.ok).toBe(true)
  if (repeat.ok) expect(repeat.events).toEqual([])
  const current = await f.recipient.read()
  expect(current.bag).toEqual(first.state.bag)
  expect(current.life).toEqual(first.state.life)
  expect(current.stamina).toBe(first.state.stamina)
  expect(f.state().jobs.owner.request).toEqual(request)
  expect(leftAt(f.state().nature, node.id, now)).toBe(node.max - 1)
  expect((await f.recipient.deliveryUpdate(null)).revision).toBe(1)
})
it.each(["reply", "source-save", "recipient-save", "alarm-save"])("recovers %s without repeating gathering or losing the reservation", async (failure) => {
  const f = await fixture(),
    id = await f.begin()
  if (failure === "reply") f.loseReply()
  if (failure === "source-save" || failure === "alarm-save") f.natureStore.failNextSave()
  if (failure === "recipient-save") f.playerStore.failNextSave()
  if (failure === "alarm-save") await expect(f.source.alarm()).rejects.toThrow("Storage unavailable")
  else await expect(f.source.finishGather("owner", id)).rejects.toThrow(failure === "reply" ? "Response lost" : "Storage unavailable")
  expect(f.state().jobs.owner.phase).toBe("pending")
  f.restart()
  await f.source.alarm()
  const first = await f.recipient.read()
  await f.source.alarm()
  const next = await f.recipient.read()
  expect(first.bag.filter(Boolean)).toHaveLength(player().bag.filter(Boolean).length + 1)
  expect(next.bag).toEqual(first.bag)
  expect(next.life).toEqual(first.life)
  expect(next.stamina).toBe(first.stamina)
  expect(leftAt(f.state().nature, node.id, now)).toBe(node.max - 1)
  expect((await f.recipient.deliveryUpdate(null)).revision).toBe(1)
})
it("does not deliver or retain a resource debit when saving the reservation fails", async () => {
  const f = await fixture()
  const before = structuredClone(f.natureStore.saved.get("__void_durable_state"))
  f.natureStore.failNextSave()
  await expect(f.begin()).rejects.toThrow("Storage unavailable")
  f.restart()
  expect(f.natureStore.saved.get("__void_durable_state")).toEqual(before)
  expect(f.receive).not.toHaveBeenCalled()
  await f.source.alarm()
  expect(f.receive).not.toHaveBeenCalled()
})
it("returns a refused reservation only once even if its reply is lost", async () => {
  const f = await fixture(),
    id = await f.begin()
  const proposal = { id: "trade", revision: 1, offer: { lots: [], gold: 0 }, outgoing: [], incoming: [], gold: 0 }
  expect((await f.recipient.prepareTrade(proposal)).ok).toBe(true)
  f.loseReply()
  await expect(f.source.finishGather("owner", id)).rejects.toThrow("Response lost")
  f.restart()
  await f.source.alarm()
  await f.source.alarm()
  expect(leftAt(f.state().nature, node.id, now)).toBe(node.max)
  expect((await f.recipient.deliveryUpdate(null)).revision).toBe(0)
})
it("rejects overlapping, changed, old and unowned requests without taking another resource", async () => {
  const f = await fixture(),
    id = await f.begin(2)
  expect(await f.source.beginGather({ owner: "owner", connection: "connection", seq: 3, node: node.id })).toEqual({ ok: false, reason: "NOT_READY" })
  expect(await f.source.beginGather({ owner: "owner", connection: "connection", seq: 2, node: NODES[1].id })).toEqual({ ok: false, reason: "NOT_READY" })
  expect(await f.source.beginGather({ owner: "owner", connection: "connection", seq: 1, node: node.id })).toEqual({ ok: false, reason: "NOT_READY" })
  expect(await f.source.beginGather({ owner: "other", connection: "wrong", seq: 1, node: node.id })).toEqual({ ok: false, reason: "NOT_READY" })
  expect(await f.source.finishGather("owner", id + 1)).toEqual({ ok: false, reason: "NOT_READY" })
  expect(leftAt(f.state().nature, node.id, now)).toBe(node.max - 1)
})
it("keeps other gatherers progressing while one recipient is unavailable", async () => {
  const f = await fixture()
  await f.begin()
  expect((await f.source.beginGather({ owner: "other", connection: "other-connection", seq: 1, node: node.id })).ok).toBe(true)
  f.receive.mockRejectedValue(Error("Unavailable"))
  await f.source.alarm()
  expect(f.state().jobs.owner.phase).toBe("pending")
  expect(f.state().jobs.other.phase).toBe("done")
  expect((await f.other.deliveryUpdate(null)).revision).toBe(1)
})
it("preserves a legacy resource clock and remaining quantity during migration", async () => {
  const nature = { nodes: { [node.id]: { left: 1, at: Date.now() } } }
  const store = durableStorage({ nature }, 0)
  await new Nature.class(store.state, {}).left(node.map)
  expect(store.saved.get("__void_durable_state")).toEqual({ __voidDurableState: true, version: 1, value: { nature, serial: 0, jobs: {} } })
})
