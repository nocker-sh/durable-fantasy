import { afterEach, expect, it, vi } from "vitest"
import type { Ctx } from "./context.ts"
import type { Presence, TradeSide } from "./presence.ts"
import type { ServerMessage } from "../../protocol.ts"
import { emptyOffer } from "../../core/trade.ts"
import { bagWith, player } from "../../test/helpers.ts"
import { mapPlayer } from "./presence.ts"

const read = vi.hoisted(() => vi.fn())
vi.mock("../../../durable-objects/player.ts", () => ({ Player: { get: () => ({ read }) } }))
import { HANDLERS } from "./trade.ts"
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
  const offer = (count = 1) =>
    HANDLERS["trade-offer"]!(
      {
        ctx: { connection: me, room: { getConnection: () => peer } },
        me: me.state,
        save: (patch: Partial<Presence>) => me.setState({ ...me.state, ...patch }),
      } as unknown as Ctx,
      { type: "trade-offer", lots: [{ slot: 0, count }], gold: 0 },
    )
  const pending = () => {
    let resolve!: (value: ReturnType<typeof player>) => void
    const promise = new Promise<ReturnType<typeof player>>((done) => {
      resolve = done
    })
    read.mockReturnValueOnce(promise)
    return () => resolve(player({ bag: bagWith(["herb", 5]) }))
  }
  return { me, peer, offer, pending }
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
