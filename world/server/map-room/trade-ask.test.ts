import { expect, it, vi } from "vitest"
import { handleTradeAsk } from "#/world/server/map-room/handle-trade-ask"
import { mapPlayer } from "#/world/server/map-room/map-player"
import { newPlayer } from "#/world/core/new-player"
import type { Presence } from "#/world/server/map-room/presence"
import type { ServerMessage } from "#/world/protocol"

function fixture() {
  const trace: string[] = []
  const me: Presence = { owner: "sender", player: mapPlayer("sender", newPlayer(), [10, 10]), route: [[10, 10]], since: Date.now(), said: [], engaged: null }
  const other: Presence = { ...me, owner: "peer", player: mapPlayer("peer", newPlayer(), [10, 10]) }
  const send = vi.fn(async (_message: ServerMessage) => {})
  const peer = {
    id: "peer",
    state: other,
    send: vi.fn(async (_message: ServerMessage) => {
      trace.push("asked")
    }),
  }
  const save = vi.fn((_patch: Partial<Presence>) => {
    trace.push("saved")
  })
  const getConnection = vi.fn(() => peer)
  const room = { me, save, ctx: { connection: { id: "sender", send }, room: { getConnection } } }
  return { me, other, peer, send, save, room, trace }
}

it("rejects an unlocated peer without saving or sending an invitation", async () => {
  const request = fixture()
  request.other.route = []
  await expect(handleTradeAsk(request.room, { type: "trade-ask", target: "peer" })).resolves.toBeUndefined()
  expect(request.send).toHaveBeenCalledExactlyOnceWith({ type: "trade-closed", reason: "TOO_FAR" })
  expect(request.save).not.toHaveBeenCalled()
  expect(request.peer.send).not.toHaveBeenCalled()
})

it("saves the invitation before notifying a nearby peer", async () => {
  const request = fixture()
  await handleTradeAsk(request.room, { type: "trade-ask", target: "peer" })
  expect(request.trace).toEqual(["saved", "asked"])
  expect(request.save).toHaveBeenCalledExactlyOnceWith({ trade: { with: "peer", open: false, offer: { lots: [], gold: 0 }, shown: [], locked: false, done: false } })
  expect(request.peer.send).toHaveBeenCalledExactlyOnceWith({ type: "trade-asked", from: "sender", name: request.me.player?.name })
})

it("keeps availability ahead of distance and does not replace the peer's state", async () => {
  const request = fixture()
  request.me.down = true
  request.other.route = []
  const before = structuredClone(request.other)
  await handleTradeAsk(request.room, { type: "trade-ask", target: "peer" })
  expect(request.send).toHaveBeenCalledExactlyOnceWith({ type: "trade-closed", reason: "BUSY" })
  expect(request.save).not.toHaveBeenCalled()
  expect(request.other).toEqual(before)
})
