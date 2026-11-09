import { afterEach, expect, it, vi } from "vitest"
import { admittedRoom } from "#/world/server/map-room/admitted-room"
import { mapPlayer } from "#/world/server/map-room/map-player"
import { player } from "#/world/test/player"
import type { Presence } from "#/world/server/map-room/presence"
import type { Cell, ServerMessage } from "#/world/protocol"

vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }))
const rpc = vi.hoisted(() => ({ ownsConnection: vi.fn(async () => true), walk: vi.fn(async () => true), leave: vi.fn(async () => {}), depart: vi.fn(async () => {}) }))
vi.mock("#/durable-objects/player", () => ({ Player: { get: () => ({ ownsConnection: rpc.ownsConnection, walk: rpc.walk, leave: rpc.leave }) } }))
vi.mock("#/durable-objects/directory", () => ({ Directory: { get: () => ({ depart: rpc.depart }) } }))
vi.mock("#/world/maps/walkable", () => ({
  walkable: (_map: unknown, cell: Cell) => cell.every((n) => n >= 0 && n < 96),
}))
import route from "#/routes/map/[mapId].ws"
afterEach(() => {
  vi.clearAllMocks()
})

/** A socket in the room: its presence is its state, as in the Void runtime. */
function socket(id: string, patch: Partial<Presence>) {
  const held = { state: { owner: null, player: null, route: [], since: 0, said: [], engaged: null, ...patch } as Presence }
  return {
    id,
    get state() {
      return held.state
    },
    setState: (state: unknown) => {
      held.state = state as Presence
    },
    send: vi.fn(async (_message: ServerMessage) => {}),
    close: vi.fn(),
  }
}

function room() {
  const mover = socket("mover", { owner: "owner", player: mapPlayer("mover", player(), [10, 10]), route: [[10, 10]], since: Date.now() })
  const peer = socket("peer", { owner: "peer-owner", player: mapPlayer("peer", player(), [20, 20]), route: [[20, 20]], since: Date.now() })
  // opened ahead, or still open after a join was refused: never let in
  const outsider = socket("outsider", { owner: "outsider-owner" })
  const leaving = socket("leaving", { owner: "leaving-owner", player: mapPlayer("leaving", player(), [30, 30]), closed: true })
  const connections = [mover, peer, outsider, leaving]
  // the runtime's own broadcast reaches every accepted socket
  const broadcast = vi.fn(async (event: ServerMessage, excludeIds: string[] = []) => {
    for (const connection of connections) if (!excludeIds.includes(connection.id)) await connection.send(event)
  })
  const controller = { broadcast, getConnections: () => connections, getConnection: (id: string) => connections.find((connection) => connection.id === id) }
  const ctx = { id: "room", params: { mapId: "1~phanthiet~1" }, user: null, request: new Request("https://example.test"), env: {}, storage: {}, connection: mover, room: controller }
  return { mover, peer, outsider, leaving, broadcast, controller, ctx }
}

it("sends room events only to connections that have been let in", async () => {
  const r = room()
  await admittedRoom(r.controller).broadcast({ type: "left", id: "someone" }, ["mover"])
  expect(r.peer.send).toHaveBeenCalledExactlyOnceWith({ type: "left", id: "someone" })
  expect(r.mover.send).not.toHaveBeenCalled()
  expect(r.outsider.send).not.toHaveBeenCalled()
  expect(r.leaving.send).not.toHaveBeenCalled()
  expect(r.broadcast).not.toHaveBeenCalled()
})

it("does not show a socket that never joined who walks in the room", async () => {
  const r = room()
  await route.onMessage!(r.ctx as never, {
    type: "move",
    path: [
      [10, 10],
      [11, 10],
    ],
  })
  expect(r.peer.send).toHaveBeenCalledExactlyOnceWith({
    type: "moved",
    id: "mover",
    path: [
      [10, 10],
      [11, 10],
    ],
  })
  expect(r.outsider.send).not.toHaveBeenCalled()
  expect(r.broadcast).not.toHaveBeenCalled()
})

it("does not tell a socket that never joined who left the room", async () => {
  const r = room()
  await route.onClose!(r.ctx as never)
  expect(r.peer.send).toHaveBeenCalledExactlyOnceWith({ type: "left", id: "mover" })
  expect(r.outsider.send).not.toHaveBeenCalled()
  expect(rpc.depart).toHaveBeenCalledExactlyOnceWith("phanthiet", 1)
})
