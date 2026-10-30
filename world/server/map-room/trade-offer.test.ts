import { afterEach, expect, it, vi } from "vitest"
import type { Ctx } from "#/world/server/map-room/context"
import type { Presence, TradeSide } from "#/world/server/map-room/presence"
import type { ServerMessage } from "#/world/protocol"
import { emptyOffer } from "#/world/core/empty-offer"
import { bagWith } from "#/world/test/bag-with"
import { player } from "#/world/test/player"
import { mapPlayer } from "#/world/server/map-room/map-player"

const read = vi.hoisted(() => vi.fn())
vi.mock("../../../durable-objects/player", () => ({ Player: { get: () => ({ read, tradeStatus: async () => null, beginTrade: async () => ({ ok: false, reason: "NOT_READY" }) }) } }))
import { HANDLERS } from "#/world/server/map-room/trade"
afterEach(() => read.mockReset())

const side = (withId: string, session = "first"): TradeSide => ({ session, with: withId, open: true, offer: emptyOffer(), shown: [], locked: false, done: false })
function socket(id: string, withId: string) {
  const state: Presence = { owner: id, player: mapPlayer(id, player(), [10, 10]), route: [[10, 10]], since: 0, said: [], engaged: null, trade: side(withId) }
  return {
    id,
    state,
    send: vi.fn(async (_event: ServerMessage) => {}),
    setState(next: Presence) {
      this.state = next
    },
  }
}
function fixture() {
  const me = socket("me", "peer"),
    peer = socket("peer", "me")
  const context = (snapshot = me.state) =>
    ({
      ctx: { connection: me, room: { getConnection: () => peer } },
      me: snapshot,
      save: (patch: Partial<Presence>) => me.setState({ ...me.state, ...patch }),
    }) as unknown as Ctx
  const offer = (count = 1) => HANDLERS["trade-offer"]!(context(), { type: "trade-offer", lots: [{ slot: 0, count }], gold: 0 })
  const pending = () => {
    let resolve!: (value: ReturnType<typeof player>) => void
    const promise = new Promise<ReturnType<typeof player>>((done) => {
      resolve = done
    })
    read.mockReturnValueOnce(promise)
    return () => resolve(player({ bag: bagWith(["herb", 5]) }))
  }
  return { me, peer, offer, pending, context }
}

it("publishes the inventory snapshot and resets both confirmations", async () => {
  const f = fixture(),
    resolve = f.pending()
  f.peer.state.trade!.locked = true
  f.peer.state.trade!.done = true
  const work = f.offer()
  resolve()
  await work
  expect(f.me.state.trade?.shown).toEqual([{ item: "herb", count: 1 }])
  expect(f.peer.state.trade).toMatchObject({ locked: false, done: false })
  expect(f.me.send).toHaveBeenCalledWith(expect.objectContaining({ type: "trade-view" }))
})

it.each(["cancelled", "locked", "settling", "closed", "reopened"] as const)("discards an inventory reply after the trade is %s", async (change) => {
  const f = fixture(),
    resolve = f.pending()
  const work = f.offer()
  if (change === "cancelled") {
    f.me.state.trade = undefined
    f.peer.state.trade = undefined
  }
  if (change === "locked") f.me.state.trade = { ...f.me.state.trade!, locked: true }
  if (change === "settling") f.peer.state.trade = { ...f.peer.state.trade!, settling: true }
  if (change === "closed") f.peer.state.closed = true
  if (change === "reopened") {
    f.me.state.trade = side("peer", "second")
    f.peer.state.trade = side("me", "second")
  }
  const before = structuredClone([f.me.state, f.peer.state])
  resolve()
  await work
  expect([f.me.state, f.peer.state]).toEqual(before)
  expect(f.me.send).not.toHaveBeenCalled()
  expect(f.peer.send).not.toHaveBeenCalled()
})

it("keeps the newest offer when inventory replies arrive in reverse order", async () => {
  const f = fixture()
  const firstReply = f.pending(),
    first = f.offer(1)
  const secondReply = f.pending(),
    second = f.offer(2)
  secondReply()
  await second
  firstReply()
  await first
  expect(f.me.state.trade?.offer.lots).toEqual([{ slot: 0, count: 2 }])
  expect(f.me.state.trade?.shown).toEqual([{ item: "herb", count: 2 }])
  expect(f.me.send).toHaveBeenCalledTimes(1)
})

it("does not unsettle a different partner's trade", async () => {
  const f = fixture(),
    resolve = f.pending()
  const work = f.offer()
  f.peer.state.trade = { ...side("third", "another"), locked: true, done: true }
  const before = structuredClone(f.peer.state.trade)
  resolve()
  await work
  expect(f.peer.state.trade).toEqual(before)
  expect(f.me.send).not.toHaveBeenCalled()
})

it.each(["trade-lock", "trade-go", "trade-cancel"] as const)("ignores a delayed %s for a previous trade with the same partner", async (type) => {
  const f = fixture()
  const previous = structuredClone(f.me.state)
  f.me.state.trade = { ...side("peer", "new"), locked: true }
  f.peer.state.trade = { ...side("me", "new"), locked: true }
  const before = structuredClone([f.me.state, f.peer.state])
  if (type === "trade-cancel") await HANDLERS["trade-cancel"]!(f.context(previous), { type })
  else if (type === "trade-go") await HANDLERS["trade-go"]!(f.context(previous), { type })
  else await HANDLERS["trade-lock"]!(f.context(previous), { type })
  expect([f.me.state, f.peer.state]).toEqual(before)
  expect(f.me.send).not.toHaveBeenCalled()
  expect(f.peer.send).not.toHaveBeenCalled()
  expect(read).not.toHaveBeenCalled()
})

it("uses the current offer flags when a delayed exchange follows an offer change", async () => {
  const f = fixture()
  const previous = { ...f.me.state, trade: { ...f.me.state.trade!, locked: true } }
  f.peer.state.trade!.locked = true
  await HANDLERS["trade-go"]!(f.context(previous), { type: "trade-go" })
  expect(f.me.state.trade?.done).toBe(false)
  expect(read).not.toHaveBeenCalled()
})

it("does not cancel a settlement that started while ownership was being checked", async () => {
  const f = fixture()
  const previous = structuredClone(f.me.state)
  f.me.state.trade!.settling = true
  await HANDLERS["trade-cancel"]!(f.context(previous), { type: "trade-cancel" })
  expect(f.me.state.trade?.settling).toBe(true)
  expect(f.peer.state.trade).toBeDefined()
  expect(f.me.send).not.toHaveBeenCalled()
})

it("still cancels both sides of the current trade", async () => {
  const f = fixture()
  await HANDLERS["trade-cancel"]!(f.context(), { type: "trade-cancel" })
  expect(f.me.state.trade).toBeUndefined()
  expect(f.peer.state.trade).toBeUndefined()
  for (const connection of [f.me, f.peer]) expect(connection.send).toHaveBeenCalledWith({ type: "trade-closed", reason: "CANCELLED" })
})

it("does not close a newer trade when an earlier settlement finishes awaiting inventory", async () => {
  const f = fixture()
  f.me.state.trade!.locked = true
  f.peer.state.trade = { ...f.peer.state.trade!, locked: true, done: true }
  const first = f.pending(),
    second = f.pending()
  const work = HANDLERS["trade-go"]!(f.context(), { type: "trade-go" })
  f.me.state.trade = side("peer", "new")
  f.peer.state.trade = side("me", "new")
  const before = structuredClone([f.me.state, f.peer.state])
  first()
  second()
  await work
  expect([f.me.state, f.peer.state]).toEqual(before)
  expect(f.me.send).not.toHaveBeenCalled()
  expect(f.peer.send).not.toHaveBeenCalled()
})
