import { afterEach, expect, it, vi } from "vitest"
import { handleJoin } from "#/world/server/map-room/handle-join"
import { newPlayer } from "#/world/core/new-player"
import { mapPlayer } from "#/world/server/map-room/map-player"
import { SPAWNS } from "#/world/core/monsters"
import type { Player } from "#/durable-objects/player"
import type { Directory } from "#/durable-objects/directory"
import type { Nature } from "#/durable-objects/nature"
import type { Wild } from "#/durable-objects/wild"
import type { mayVisit } from "#/world/core/may-visit"
import type { spawnsOn } from "#/world/core/spawns-on"
import type { Ctx } from "#/world/server/map-room/context"
import type { Presence } from "#/world/server/map-room/presence"
import type { ServerMessage } from "#/world/protocol"

type PlayerRpc = ReturnType<typeof Player.get>
const rpc = vi.hoisted(() => ({
  read: vi.fn<PlayerRpc["read"]>(),
  arrive: vi.fn<PlayerRpc["arrive"]>(),
  leave: vi.fn<PlayerRpc["leave"]>(),
  count: vi.fn<ReturnType<typeof Directory.get>["arrive"]>(),
  depart: vi.fn<ReturnType<typeof Directory.get>["depart"]>(),
  left: vi.fn<ReturnType<typeof Nature.get>["left"]>(),
  wild: vi.fn<ReturnType<typeof Wild.get>["snapshot"]>(),
  spawns: vi.fn<typeof spawnsOn>(),
  visit: vi.fn<typeof mayVisit>(),
}))
vi.mock("#/durable-objects/player", () => ({ Player: { get: () => ({ read: rpc.read, arrive: rpc.arrive, leave: rpc.leave }) } }))
vi.mock("#/durable-objects/directory", () => ({ Directory: { get: () => ({ arrive: rpc.count, depart: rpc.depart }) } }))
vi.mock("#/durable-objects/nature", () => ({ Nature: { get: () => ({ left: rpc.left }) } }))
vi.mock("#/durable-objects/wild", () => ({ Wild: { get: () => ({ snapshot: rpc.wild }) } }))
vi.mock("#/world/core/may-visit", () => ({ mayVisit: rpc.visit }))
vi.mock("#/world/core/spawns-on", () => ({ spawnsOn: rpc.spawns }))
afterEach(() => {
  vi.resetAllMocks()
  vi.unstubAllEnvs()
})

function fixture() {
  const trace: string[] = []
  const data = { ...newPlayer(), profileComplete: true }
  const state: Presence = { owner: "owner", player: null, route: [], since: 0, said: [], engaged: null }
  const self = {
    id: "connection",
    state,
    send: vi.fn(async (message: ServerMessage) => {
      trace.push(message.type)
    }),
    close: vi.fn(),
  }
  const duplicate = { ...self, id: "duplicate", state: { ...state, player: mapPlayer("duplicate", data, [0, 0]) }, close: vi.fn() }
  const peer = { ...self, id: "peer", state: { ...state, owner: "other", player: mapPlayer("peer", data, [0, 0]) } }
  const hidden = { ...self, id: "hidden", state: { ...state, owner: "hidden-owner", ready: false, player: mapPlayer("hidden", data, [0, 0]) } }
  const save = vi.fn((patch: Partial<Presence>) => {
    self.state = { ...self.state, ...patch }
    trace.push("save")
  })
  const broadcast = vi.fn<Ctx["ctx"]["room"]["broadcast"]>(async () => {
    trace.push("broadcast")
  })
  rpc.read.mockImplementation(async () => {
    trace.push("read")
    return data
  })
  rpc.count.mockImplementation(async () => {
    trace.push("count")
    return true
  })
  rpc.arrive.mockImplementation(async () => {
    trace.push("arrive")
    return { accepted: true, map: "map", at: [2, 3] }
  })
  rpc.leave.mockImplementation(async () => {
    trace.push("leave")
  })
  rpc.depart.mockImplementation(async () => {
    trace.push("depart")
  })
  rpc.left.mockImplementation(async () => {
    trace.push("left")
    return { tree: 2 }
  })
  rpc.wild.mockResolvedValue({ revision: 1, monsters: {} })
  rpc.spawns.mockReturnValue([])
  rpc.visit.mockReturnValue(true)
  const room = {
    get me() {
      return self.state
    },
    save,
    key: { world: 1, map: "map", channel: 2 },
    map: { size: 8, rows: Array.from({ length: 8 }, () => ".".repeat(8)), spawn: [0, 0] satisfies readonly [number, number] },
    ctx: { connection: self, params: { mapId: "room" }, room: { getConnections: () => [self, duplicate, peer, hidden], broadcast } },
  }
  const join = () => handleJoin(room, { type: "join", player: "owner", at: [0, 0] })
  return { data, self, duplicate, peer, hidden, save, broadcast, room, join, trace }
}

it("reads the player before reserving a channel, admits before snapshot, and excludes hidden or duplicate players", async () => {
  const request = fixture()
  await request.join()
  expect(request.trace).toEqual(["save", "read", "count", "arrive", "save", "left", "snapshot", "nodes", "broadcast", "save"])
  expect(request.duplicate.close).toHaveBeenCalledExactlyOnceWith(4001, "Character opened elsewhere")
  expect(request.self.send).toHaveBeenNthCalledWith(1, { type: "snapshot", you: "connection", me: request.data, players: [request.peer.state.player], at: [2, 3] })
  expect(request.self.state).toMatchObject({ joining: false, ready: true, route: [[2, 3]] })
  expect(rpc.depart).not.toHaveBeenCalled()
})

it("does not reserve a channel after a player read failure", async () => {
  const request = fixture()
  rpc.read.mockRejectedValue(Error("Read failed"))
  await expect(request.join()).rejects.toThrow("Read failed")
  expect(rpc.count).not.toHaveBeenCalled()
  expect(rpc.depart).not.toHaveBeenCalled()
  expect(request.self.state.joining).toBe(false)
})

it("rejects a full channel without arriving or returning a reservation it did not take", async () => {
  const request = fixture()
  rpc.count.mockResolvedValue(false)
  await request.join()
  expect(request.self.send).toHaveBeenCalledExactlyOnceWith({ type: "refused", what: "join", reason: "FULL" })
  expect(rpc.arrive).not.toHaveBeenCalled()
  expect(rpc.depart).not.toHaveBeenCalled()
})

it("returns the reserved count when the connection closes before arrival", async () => {
  const request = fixture()
  request.self.state.closed = true
  await request.join()
  expect(rpc.arrive).not.toHaveBeenCalled()
  expect(rpc.depart).toHaveBeenCalledExactlyOnceWith("map", 2)
  expect(request.self.state.joining).toBe(false)
})

it("releases the player connection and count when closing while arrival is saved", async () => {
  const request = fixture()
  rpc.arrive.mockImplementation(async () => {
    request.self.state = { ...request.self.state, closed: true }
    return { accepted: true, map: "map", at: [2, 3] }
  })
  await request.join()
  expect(rpc.leave).toHaveBeenCalledExactlyOnceWith("connection")
  expect(rpc.depart).toHaveBeenCalledExactlyOnceWith("map", 2)
  expect(request.self.send).not.toHaveBeenCalled()
})

it("redirects to the saved destination and returns the unused count", async () => {
  const request = fixture()
  rpc.arrive.mockResolvedValue({ accepted: false, map: "home", at: [1, 1] })
  await request.join()
  expect(request.self.send).toHaveBeenCalledExactlyOnceWith({ type: "warped", map: "home", at: [1, 1] })
  expect(rpc.depart).toHaveBeenCalledOnce()
  expect(request.self.state.player).toBeNull()
})

it("does not broadcast an unfinished profile and substitutes the spawn for an unwalkable arrival", async () => {
  const request = fixture()
  request.data.profileComplete = false
  rpc.arrive.mockResolvedValue({ accepted: true, map: "map", at: [99, 99] })
  await request.join()
  expect(request.self.state).toMatchObject({ ready: false, route: [[0, 0]] })
  expect(request.broadcast).not.toHaveBeenCalled()
})

it("sends resource and creature snapshots after the player snapshot", async () => {
  const request = fixture()
  rpc.spawns.mockReturnValue(SPAWNS.slice(0, 1))
  await request.join()
  expect(request.self.send.mock.calls.map((call) => call[0].type)).toEqual(["snapshot", "nodes", "wild"])
  expect(rpc.wild).toHaveBeenCalledExactlyOnceWith("map")
})

it("does not return an admitted count when the snapshot notification fails, even if resource reading also fails", async () => {
  const request = fixture()
  request.self.send.mockRejectedValue(Error("Snapshot failed"))
  rpc.left.mockRejectedValue(Error("Resources failed"))
  await expect(request.join()).rejects.toThrow("Snapshot failed")
  expect(rpc.depart).not.toHaveBeenCalled()
  expect(request.self.state.joining).toBe(false)
})

it("propagates resource failure after the player snapshot without returning an admitted count", async () => {
  const request = fixture()
  rpc.left.mockRejectedValue(Error("Resources failed"))
  await expect(request.join()).rejects.toThrow("Resources failed")
  expect(request.self.send).toHaveBeenCalledOnce()
  expect(rpc.depart).not.toHaveBeenCalled()
})

it("clears the joining flag even if returning an unused count fails", async () => {
  const request = fixture()
  request.self.state.closed = true
  rpc.depart.mockRejectedValue(Error("Departure failed"))
  await expect(request.join()).rejects.toThrow("Departure failed")
  expect(request.self.state.joining).toBe(false)
})

it.each(["already-present", "joining", "other-owner", "missing-owner"])("ignores an inadmissible request: %s", async (reason) => {
  const request = fixture()
  if (reason === "already-present") request.self.state.player = mapPlayer("connection", request.data, [0, 0])
  if (reason === "joining") request.self.state.joining = true
  if (reason === "other-owner") request.self.state.owner = "other"
  if (reason === "missing-owner") request.self.state.owner = null
  await request.join()
  expect(rpc.read).not.toHaveBeenCalled()
  expect(request.save).not.toHaveBeenCalled()
})

it("returns the reserved count after refusing an unauthorized production visit", async () => {
  const request = fixture()
  vi.stubEnv("DEV", false)
  rpc.visit.mockReturnValue(false)
  await request.join()
  expect(request.self.send).toHaveBeenCalledExactlyOnceWith({ type: "refused", what: "join", reason: "NOT_YOUR_TOWN" })
  expect(rpc.arrive).not.toHaveBeenCalled()
  expect(rpc.depart).toHaveBeenCalledExactlyOnceWith("map", 2)
  expect(request.self.state.joining).toBe(false)
})

it("does not admit a connection that closes between arrival confirmation and presence publication", async () => {
  const request = fixture()
  rpc.arrive.mockImplementation(async () => ({
    map: "map",
    at: [2, 3],
    get accepted() {
      queueMicrotask(() => {
        request.self.state = { ...request.self.state, closed: true }
      })
      return true
    },
  }))
  await request.join()
  expect(rpc.leave).toHaveBeenCalledExactlyOnceWith("connection")
  expect(rpc.depart).toHaveBeenCalledExactlyOnceWith("map", 2)
  expect(request.self.state.player).toBeNull()
  expect(request.duplicate.close).not.toHaveBeenCalled()
  expect(request.self.send).not.toHaveBeenCalled()
})

it("publishes the saved status and requested clock along with the admitted route", async () => {
  const request = fixture()
  request.data.hp = 0
  request.data.sitting = true
  request.data.party = "group"
  const before = structuredClone(request.data)
  await handleJoin(request.room, { type: "join", player: "owner", at: [0, 0], time: 600 })
  expect(request.self.state).toMatchObject({ down: true, sitting: true, party: "group", held: 600, ready: true, route: [[2, 3]] })
  expect(request.data).toEqual(before)
})
