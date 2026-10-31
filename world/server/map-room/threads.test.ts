import { afterEach, expect, it, vi } from "vitest"
import { handleThreadAsk } from "#/world/server/map-room/handle-thread-ask"
import { handleThreadAnswer } from "#/world/server/map-room/handle-thread-answer"
import { threadOf } from "#/world/core/thread-of"
import { newPlayer } from "#/world/core/new-player"
import { mapPlayer } from "#/world/server/map-room/map-player"
import type { Presence } from "#/world/server/map-room/presence"
import type { ServerMessage } from "#/world/protocol"
import type { ServerCommand } from "#/world/core/commands"

const rpc = vi.hoisted(() => ({ get: vi.fn() }))
vi.mock("#/durable-objects/player", () => ({ Player: { get: rpc.get } }))
afterEach(() => {
  vi.resetAllMocks()
  vi.useRealTimers()
})

function fixture() {
  const trace: string[] = []
  const me: Presence = { owner: "self-owner", player: mapPlayer("self", newPlayer("Self"), [10, 10]), route: [[10, 10]], since: Date.now(), said: [], engaged: null }
  const other: Presence = { ...me, owner: "peer-owner", player: mapPlayer("peer", newPlayer("Peer"), [10, 10]), threading: "self" }
  const peer = {
    id: "peer",
    state: other,
    send: vi.fn(async (_message: ServerMessage) => {
      trace.push("peer-send")
    }),
    setState(next: Presence) {
      peer.state = next
      trace.push("peer-state")
    },
  }
  const send = vi.fn(async (_message: ServerMessage) => {
    trace.push("self-send")
  })
  const save = vi.fn((_patch: Partial<Presence>) => {
    trace.push("save")
  })
  const run = vi.fn(async (_command: ServerCommand) => ({ ok: true, state: newPlayer(), events: [] }))
  rpc.get.mockImplementation((owner: string) => {
    trace.push(owner)
    return { run }
  })
  const room = { me, save, ctx: { connection: { id: "self", send }, room: { getConnection: () => peer } } }
  return { me, other, peer, send, save, run, room, trace }
}

it("rejects an unlocated peer without saving or delivering an invitation", async () => {
  const request = fixture()
  request.other.route = []
  await expect(handleThreadAsk(request.room, { type: "thread-ask", target: "peer" })).resolves.toBeUndefined()
  expect(request.send).toHaveBeenCalledExactlyOnceWith({ type: "thread-closed", reason: "TOO_FAR" })
  expect(request.save).not.toHaveBeenCalled()
  expect(request.peer.send).not.toHaveBeenCalled()
})

it("saves a nearby request before notifying the peer without exchanging threads", async () => {
  const request = fixture()
  await handleThreadAsk(request.room, { type: "thread-ask", target: "peer" })
  expect(request.trace).toEqual(["save", "peer-send"])
  expect(request.save).toHaveBeenCalledExactlyOnceWith({ threading: "peer" })
  expect(request.peer.send).toHaveBeenCalledExactlyOnceWith({ type: "thread-asked", from: "self", name: "Self" })
  expect(rpc.get).not.toHaveBeenCalled()
})

it("ignores a response to a withdrawn request", async () => {
  const request = fixture()
  request.other.threading = undefined
  await handleThreadAnswer(request.room, { type: "thread-answer", from: "peer", yes: true })
  expect(request.trace).toEqual([])
})

it("consumes a declined request without changing either player's threads", async () => {
  const request = fixture()
  await handleThreadAnswer(request.room, { type: "thread-answer", from: "peer", yes: false })
  expect(request.peer.state.threading).toBeUndefined()
  expect(request.peer.send).toHaveBeenCalledExactlyOnceWith({ type: "thread-closed", reason: "DECLINED" })
  expect(rpc.get).not.toHaveBeenCalled()
})

it("exchanges reciprocal thread values with the same time in the existing save and reply order", async () => {
  vi.useFakeTimers()
  vi.setSystemTime(1000)
  const request = fixture()
  await handleThreadAnswer(request.room, { type: "thread-answer", from: "peer", yes: true })
  expect(request.trace).toEqual(["peer-state", "self-owner", "self-send", "peer-owner", "peer-send"])
  expect(request.run).toHaveBeenNthCalledWith(1, { type: "thread", thread: threadOf("peer-owner", "Peer", 1000) })
  expect(request.run).toHaveBeenNthCalledWith(2, { type: "thread", thread: threadOf("self-owner", "Self", 1000) })
  expect(request.peer.state.threading).toBeUndefined()
})

it("propagates the first save failure without sending results or starting the second save", async () => {
  const request = fixture()
  request.run.mockRejectedValue(Error("Unavailable"))
  await expect(handleThreadAnswer(request.room, { type: "thread-answer", from: "peer", yes: true })).rejects.toThrow("Unavailable")
  expect(rpc.get).toHaveBeenCalledExactlyOnceWith("self-owner")
  expect(request.send).not.toHaveBeenCalled()
  expect(request.peer.send).not.toHaveBeenCalled()
})
