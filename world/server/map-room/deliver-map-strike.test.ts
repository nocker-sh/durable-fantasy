import { afterEach, expect, it, vi } from "vitest"
import { deliverMapStrike } from "#/world/server/map-room/deliver-map-strike"
import { mapPlayer } from "#/world/server/map-room/map-player"
import { player } from "#/world/test/player"
import type { MapStrikePublication } from "#/world/server/map-room/attack-types"
import type { Presence } from "#/world/server/map-room/presence"

vi.mock("#/durable-objects/player", () => ({ Player: { get: vi.fn() } }))
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

function fixture(hp = 0) {
  const saved = player({ hp })
  const trace: string[] = []
  const me: Presence = {
    owner: "owner",
    player: mapPlayer("connection", saved, [0, 0]),
    route: [
      [0, 0],
      [1, 0],
      [2, 0],
    ],
    since: 0,
    said: [],
    engaged: null,
  }
  const save = vi.fn((patch: Partial<Presence>) => {
    trace.push("save")
    Object.assign(me, patch)
  })
  const send = vi.fn(async () => {
    trace.push("result")
  })
  const broadcast = vi.fn(async () => {
    trace.push("hitback")
  })
  const delivery: MapStrikePublication = {
    room: {
      me,
      save,
      standUp: async () => true,
      key: { map: "field" },
      map: { size: 1, rows: ["."] },
      ctx: { params: { mapId: "field" }, connection: { send }, room: { broadcast, getConnections: () => [] } },
    },
    message: { type: "attack", monster: "target" },
    attack: {
      owner: "owner",
      playerId: "connection",
      spawn: { id: "target", map: "field", kind: "slime", area: [0, 0, 1, 1] },
      now: 0,
      data: saved,
      life: 0,
      defense: { atk: 0, def: 0, hit: 0, flee: 0, crit: 0 },
      blow: { kind: "miss" },
    },
    wild: { deliverStrike: vi.fn<MapStrikePublication["wild"]["deliverStrike"]>(async () => [{ owner: "owner", result: { ok: true, state: saved, events: [] } }]) },
    id: 1,
    result: { refused: false, beaten: false, hp: 1, back: 0, counter: { kind: "hit", damage: 1 } },
  }
  return { delivery, me, saved, trace, save, send, broadcast }
}

it("records death without inventing an undefined position when the route is absent", async () => {
  const request = fixture()
  request.me.route = []
  await deliverMapStrike(request.delivery)
  expect(request.me.down).toBe(true)
  expect(request.me.route).toEqual([])
  expect(request.save).toHaveBeenCalledExactlyOnceWith({ down: true })
  expect(request.trace).toEqual(["result", "save", "hitback"])
})

it("stops at the reached cell before broadcasting death even when both notifications fail", async () => {
  vi.useFakeTimers()
  vi.setSystemTime(2000)
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
  const request = fixture()
  const route = request.me.route
  request.send.mockRejectedValue(Error("Socket closed"))
  request.broadcast.mockRejectedValue(Error("Socket closed"))
  await deliverMapStrike(request.delivery)
  expect(request.me).toMatchObject({ down: true, route: [[2, 0]], since: 2000 })
  expect(request.me.route[0]).not.toBe(route[2])
  expect(warn).toHaveBeenCalledTimes(2)
})

it("does not mark a surviving player down or stop their route", async () => {
  const request = fixture(1)
  await deliverMapStrike(request.delivery)
  expect(request.save).not.toHaveBeenCalled()
  expect(request.broadcast).toHaveBeenCalledExactlyOnceWith({ type: "hitback", monster: "target", target: "connection", swing: { kind: "hit", damage: 1 }, down: false })
})
