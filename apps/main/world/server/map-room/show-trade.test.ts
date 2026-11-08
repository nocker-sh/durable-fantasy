import { expect, it, vi } from "vitest"
import { getTradeView } from "#/world/server/map-room/get-trade-view"
import { showTrade } from "#/world/server/map-room/show-trade"
import { newPlayer } from "#/world/core/new-player"
import { mapPlayer } from "#/world/server/map-room/map-player"
import type { TradeSide, Presence } from "#/world/server/map-room/presence"
import type { ServerMessage } from "#/world/protocol"

function connection(id: string, peer: string) {
  const trade: TradeSide = { session: "session", with: peer, open: true, offer: { lots: [{ slot: 7, count: 2 }], gold: 3 }, shown: [{ item: "log", count: 2 }], locked: true, done: false }
  const state: Presence = { owner: id, player: mapPlayer(id, newPlayer(id), [10, 10]), route: [[10, 10]], since: 0, said: [], engaged: null, trade }
  return { id, state, trade, send: vi.fn(async (_message: ServerMessage) => {}) }
}

it("only includes the viewer's slot numbers and keeps the displayed item metadata", () => {
  const mine = connection("sender", "peer")
  const other = connection("peer", "sender")
  other.trade.offer = { lots: [{ slot: 99, count: 1 }], gold: 8 }
  other.trade.shown = [{ item: "log", count: 1, q: 2, by: "maker" }]
  const before = structuredClone([mine.state, other.state])
  const view = getTradeView({ mine: mine.trade, theirs: other.trade, peerId: other.id, peerName: "peer" })
  expect(view).toEqual({
    type: "trade-view",
    with: "peer",
    name: "peer",
    lots: [{ slot: 7, count: 2 }],
    mine: { stacks: mine.trade.shown, gold: 3, locked: true, done: false },
    theirs: { stacks: other.trade.shown, gold: 8, locked: true, done: false },
  })
  expect(view.lots).not.toBe(mine.trade.offer.lots)
  expect([mine.state, other.state]).toEqual(before)
})

it("sends each participant their own view in sequence", async () => {
  const sender = connection("sender", "peer")
  const recipient = connection("peer", "sender")
  recipient.trade.offer = { lots: [], gold: 8 }
  await showTrade(sender, recipient)
  expect(sender.send).toHaveBeenCalledExactlyOnceWith(getTradeView({ mine: sender.trade, theirs: recipient.trade, peerId: "peer", peerName: "peer" }))
  expect(recipient.send).toHaveBeenCalledExactlyOnceWith(getTradeView({ mine: recipient.trade, theirs: sender.trade, peerId: "sender", peerName: "sender" }))
  expect(sender.send.mock.invocationCallOrder[0]).toBeLessThan(recipient.send.mock.invocationCallOrder[0])
})

it.each(["player", "trade"])("sends nothing when a participant has no %s", async (missing) => {
  const sender = connection("sender", "peer")
  const recipient = connection("peer", "sender")
  if (missing === "player") recipient.state.player = null
  else recipient.state.trade = undefined
  await showTrade(sender, recipient)
  expect(sender.send).not.toHaveBeenCalled()
  expect(recipient.send).not.toHaveBeenCalled()
})

it("propagates the first send failure without sending the second view", async () => {
  const sender = connection("sender", "peer")
  const recipient = connection("peer", "sender")
  sender.send.mockRejectedValue(Error("Disconnected"))
  await expect(showTrade(sender, recipient)).rejects.toThrow("Disconnected")
  expect(recipient.send).not.toHaveBeenCalled()
})
