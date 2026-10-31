import { expect, it } from "vitest"
import { getMapRoomFootprints } from "#/world/maps/get-map-room-footprints"
import type { MapSpace } from "#/world/maps/map-space-types"

const space = (quarterTurns: number): MapSpace => ({
  parentMap: "outside",
  frame: { origin: [100, 5, 200], width: 8, depth: 6, quarterTurns },
  planarOrigin: [10, 20],
  metresPerPlanarUnit: 0.5,
  rooms: [{ id: "room", footprint: [{ x0: 1, z0: 2, x1: 3, z1: 4 }] }],
})
const cases = [
  { turn: 0, bounds: { x0: 101, z0: 202, x1: 103, z1: 204 } },
  { turn: 1, bounds: { x0: 102, z0: 205, x1: 104, z1: 207 } },
  { turn: 2, bounds: { x0: 105, z0: 202, x1: 107, z1: 204 } },
  { turn: 3, bounds: { x0: 102, z0: 201, x1: 104, z1: 203 } },
]
it.each(cases)("projects exact strip corners under quarter turn $turn", (input) => {
  const map = { id: "inside", space: space(input.turn) },
    original = structuredClone(map)
  expect(getMapRoomFootprints(map)).toEqual([{ mapId: "inside", roomId: "room", parentMap: "outside", elevationMetres: 5, bounds: input.bounds }])
  expect(map).toEqual(original)
})
it("does not apply display scale to an already metric room", () => {
  const placement = space(0)
  expect(getMapRoomFootprints({ id: "inside", space: { ...placement, metresPerPlanarUnit: 3, planarOrigin: [-50, 1000] } })).toEqual(getMapRoomFootprints({ id: "inside", space: placement }))
})
it("does not invent a room footprint for unplaced or unspecified room geometry", () => {
  expect(getMapRoomFootprints({ id: "unknown" })).toEqual([])
  const placement = space(0)
  expect(getMapRoomFootprints({ id: "unknown-rooms", space: { ...placement, rooms: undefined } })).toEqual([])
})
it.each(["x", "z"])("rejects a strip collapsed by translation along %s instead of silently losing its overlap", (axis) => {
  const placement = space(0)
  const origin: readonly [number, number, number] = axis === "x" ? [1e16, 0, 200] : [100, 0, 1e16]
  const map = { id: "inside", space: { ...placement, frame: { ...placement.frame, origin }, rooms: [{ id: "room", footprint: [{ x0: 0.25, z0: 0.25, x1: 0.5, z1: 0.5 }] }] } }
  expect(() => getMapRoomFootprints(map)).toThrow("Map room footprint collapses in parent space: inside / room")
})
it("keeps the map identity on invalid frame diagnostics", () => {
  const placement = space(0)
  expect(() => getMapRoomFootprints({ id: "inside", space: { ...placement, frame: { ...placement.frame, width: 0 } } })).toThrow("Map space frame is invalid: inside")
})
