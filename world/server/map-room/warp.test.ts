import { afterEach, expect, it, vi } from "vitest"
import { handleWarp } from "#/world/server/map-room/handle-warp"
import { newPlayer } from "#/world/core/new-player"
import { mapPlayer } from "#/world/server/map-room/map-player"
import type { Player } from "#/durable-objects/player"
import type { Presence } from "#/world/server/map-room/presence"
import type { Warp } from "#/world/maps/types"
import type { ServerMessage } from "#/world/protocol"

type Rpc = ReturnType<typeof Player.get>
const rpc = vi.hoisted(() => ({ get: vi.fn(), journey: vi.fn<Rpc["journey"]>(), isOpen: vi.fn(() => true) }))
vi.mock("#/durable-objects/player", () => ({ Player: { get: rpc.get } }))
vi.mock("#/world/maps/is-open", () => ({ isOpen: rpc.isOpen }))
vi.mock("#/world/maps", () => ({ MAPS: { field: { kind: "field" }, inside: { kind: "indoor" } } }))
afterEach(() => vi.resetAllMocks())

function fixture() {
  const trace: string[] = []
  const me: Presence = { owner: "owner", player: mapPlayer("connection", newPlayer(), [0, 0]), route: [[0, 0]], since: Date.now(), said: [], engaged: null }
  const warps: Warp[] = [{ at: [0, 0], to: { map: "field", at: [1, 2] } }]
  const send = vi.fn(async (message: ServerMessage) => {
    trace.push(message.type)
  })
  rpc.isOpen.mockReturnValue(true)
  rpc.journey.mockImplementation(async () => {
    trace.push("journey")
    return { ok: true }
  })
  rpc.get.mockReturnValue({ journey: rpc.journey })
  const room = { me, map: { warps }, ctx: { connection: { id: "connection", send } } }
  return { room, me, warps, send, trace }
}

it("saves fatigue and travel in one call and only notifies after it is accepted", async () => {
  const request = fixture()
  await handleWarp(request.room, { type: "warp", warp: 0 })
  expect(request.trace).toEqual(["journey", "warped"])
  expect(rpc.journey).toHaveBeenCalledExactlyOnceWith({ connection: "connection", map: "field", at: [1, 2], tire: 4 })
  expect(request.send).toHaveBeenCalledExactlyOnceWith({ type: "warped", map: "field", at: [1, 2] })
})

it("rejects closed destinations before charging fatigue or saving travel", async () => {
  const request = fixture()
  rpc.isOpen.mockReturnValue(false)
  await handleWarp(request.room, { type: "warp", warp: 0 })
  expect(request.send).toHaveBeenCalledExactlyOnceWith({ type: "refused", what: "warp", reason: "ROAD_CLOSED" })
  expect(rpc.get).not.toHaveBeenCalled()
})

it("passes on why the road was refused", async () => {
  const request = fixture()
  rpc.journey.mockResolvedValue({ ok: false, reason: "EXHAUSTED" })
  await handleWarp(request.room, { type: "warp", warp: 0 })
  expect(request.send).toHaveBeenCalledExactlyOnceWith({ type: "refused", what: "warp", reason: "EXHAUSTED" })
})

it("does not charge fatigue for indoor destinations", async () => {
  const request = fixture()
  request.warps[0].to.map = "inside"
  await handleWarp(request.room, { type: "warp", warp: 0 })
  expect(rpc.journey).toHaveBeenCalledExactlyOnceWith({ connection: "connection", map: "inside", at: [1, 2], tire: 0 })
  expect(request.trace).toEqual(["journey", "warped"])
})

it("does not notify a transition that the saved player refused", async () => {
  const request = fixture()
  rpc.journey.mockResolvedValue({ ok: false })
  await handleWarp(request.room, { type: "warp", warp: 0 })
  expect(request.send).not.toHaveBeenCalled()
})

it.each(["distant", "unknown-exit", "engaged"])("rejects %s before opening a persistent-state stub", async (rejection) => {
  const request = fixture()
  if (rejection === "distant") request.me.route = [[80, 80]]
  if (rejection === "engaged") request.me.engaged = "resident"
  await handleWarp(request.room, { type: "warp", warp: rejection === "unknown-exit" ? 99 : 0 })
  expect(request.send).toHaveBeenCalledExactlyOnceWith({ type: "refused", what: "warp" })
  expect(rpc.get).not.toHaveBeenCalled()
})
