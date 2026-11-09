import { expect, it } from "vitest"
import { getMapRoomVolumes } from "#/world/maps/get-map-room-volumes"
import type { MapSpace, MapSpaceRegistry } from "#/world/maps/map-space-types"

const footprint = [{ x0: 1, z0: 1, x1: 3, z1: 2 }]
const space = (heightMetres?: number): MapSpace => ({
  parentMap: "root",
  frame: { origin: [10, 3, 20], width: 6, depth: 6, quarterTurns: 0 },
  planarOrigin: [100, 200],
  metresPerPlanarUnit: 8,
  rooms: [{ id: "room", footprint, heightMetres }],
})
const registry = (placement: MapSpace): MapSpaceRegistry => ({ root: { id: "root" }, inside: { id: "inside", space: placement } })
it("projects measured floor-to-ceiling heights without applying the display scale", () => {
  const maps = registry(space(2)),
    before = structuredClone(maps)
  expect(getMapRoomVolumes(maps, "inside")).toEqual([{ mapId: "inside", roomId: "room", rootSpace: "root", elevationMetres: 3, ceilingElevationMetres: 5, bounds: { x0: 11, z0: 21, x1: 13, z1: 22 } }])
  expect(maps).toEqual(before)
})
it("adds ancestor elevations once while retaining the measured clear height", () => {
  const placement = space(2),
    maps = registry({ ...placement, parentMap: "parent" })
  const volumes = getMapRoomVolumes({ ...maps, parent: { id: "parent", space: { ...placement, rooms: undefined, frame: { ...placement.frame, origin: [0, 10, 0], quarterTurns: 1 } } } }, "inside")
  expect(volumes[0].elevationMetres).toBe(13)
  expect(volumes[0].ceilingElevationMetres).toBe(15)
})
it("keeps unknown room heights and unknown room geometry out of the measured volume list", () => {
  expect(getMapRoomVolumes(registry(space()), "inside")).toEqual([])
  expect(getMapRoomVolumes(registry({ ...space(2), rooms: undefined }), "inside")).toEqual([])
  expect(getMapRoomVolumes({ unknown: { id: "unknown" } }, "unknown")).toEqual([])
})
it.each([0, -1, NaN, Infinity])("rejects invalid declared clear height %s", (height) => {
  expect(() => getMapRoomVolumes(registry(space(height)), "inside")).toThrow("Invalid map room height")
})
it.each([null, "2"])("does not coerce a malformed declared height %s", (height) => {
  const placement = space(2),
    room = placement.rooms?.[0]
  if (!room) throw new Error("Missing measured room")
  Reflect.set(room, "heightMetres", height)
  expect(() => getMapRoomVolumes(registry(placement), "inside")).toThrow("Invalid map room height")
})
it.each([
  { floor: 1e16, height: 1 },
  { floor: 1e308, height: 1e308 },
])("rejects volume lost or overflowing after parent translation: %j", (input) => {
  const placement = space(input.height)
  expect(() => getMapRoomVolumes(registry({ ...placement, frame: { ...placement.frame, origin: [0, input.floor, 0] } }), "inside")).toThrow("Map room volume collapses in parent space")
})
