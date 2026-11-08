import { afterEach, expect, it, vi } from "vitest"
import { handleMove } from "#/world/server/map-room/handle-move"
import { newPlayer } from "#/world/core/new-player"
import { mapPlayer } from "#/world/server/map-room/map-player"
import type { Ctx } from "#/world/server/map-room/context"
import type { Player } from "#/durable-objects/player"
import type { Presence } from "#/world/server/map-room/presence"
import type { ServerMessage } from "#/world/protocol"

const walk = vi.hoisted(() => vi.fn<ReturnType<typeof Player.get>["walk"]>())
vi.mock("#/durable-objects/player", () => ({ Player: { get: () => ({ walk }) } }))
afterEach(() => {
  vi.resetAllMocks()
  vi.useRealTimers()
})

function fixture() {
  const trace: string[] = []
  const me: Presence = { owner: "owner", player: mapPlayer("connection", newPlayer(), [10, 10]), route: [[10, 10]], since: Date.now(), said: [], engaged: null }
  const send = vi.fn(async (_message: ServerMessage) => {
    trace.push("send")
  })
  const broadcast = vi.fn<Ctx["ctx"]["room"]["broadcast"]>(async () => {
    trace.push("broadcast")
  })
  const save = vi.fn((_patch: Partial<Presence>) => {
    trace.push("save")
  })
  const standUp = vi.fn(async () => {
    trace.push("stand")
    return true
  })
  walk.mockImplementation(async () => {
    trace.push("walk")
    return true
  })
  const room = { me, save, standUp, map: { size: 96, rows: Array.from({ length: 96 }, () => ".".repeat(96)) }, ctx: { connection: { id: "connection", send }, room: { broadcast } } }
  return { me, send, broadcast, save, standUp, trace, room }
}

it("does not persist an invented position when refusing an unlocated player", async () => {
  const request = fixture()
  request.me.route = []
  await handleMove(request.room, { type: "move", path: [[50, 50]] })
  expect(walk).not.toHaveBeenCalled()
  expect(request.save).not.toHaveBeenCalled()
  expect(request.broadcast).not.toHaveBeenCalled()
  expect(request.send).toHaveBeenCalledExactlyOnceWith({ type: "refused", what: "move" })
})

it("corrects an invalid path before broadcasting and replying", async () => {
  const request = fixture()
  await handleMove(request.room, { type: "move", path: [[50, 50]] })
  expect(request.trace).toEqual(["walk", "save", "broadcast", "send"])
  expect(walk).toHaveBeenCalledExactlyOnceWith({ connection: "connection", route: [[10, 10]] })
  expect(request.standUp).not.toHaveBeenCalled()
})

it("does not publish a correction that the saved player rejects", async () => {
  const request = fixture()
  walk.mockResolvedValue(false)
  await handleMove(request.room, { type: "move", path: [[50, 50]] })
  expect(request.save).not.toHaveBeenCalled()
  expect(request.broadcast).not.toHaveBeenCalled()
  expect(request.send).toHaveBeenCalledExactlyOnceWith({ type: "refused", what: "move", at: [10, 10] })
})

it("saves an accepted path before broadcasting it", async () => {
  const request = fixture()
  await handleMove(request.room, {
    type: "move",
    path: [
      [10, 10],
      [11, 10],
    ],
  })
  expect(request.trace).toEqual(["stand", "walk", "save", "broadcast"])
  expect(request.send).not.toHaveBeenCalled()
})

it("does not save or publish a failed walking request", async () => {
  const request = fixture()
  walk.mockRejectedValue(Error("Unavailable"))
  await expect(
    handleMove(request.room, {
      type: "move",
      path: [
        [10, 10],
        [11, 10],
      ],
    }),
  ).rejects.toThrow("Unavailable")
  expect(request.save).not.toHaveBeenCalled()
  expect(request.broadcast).not.toHaveBeenCalled()
  expect(request.send).not.toHaveBeenCalled()
})
