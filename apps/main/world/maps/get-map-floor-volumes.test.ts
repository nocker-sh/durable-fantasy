import { expect, it } from "vitest"
import { getMapFloorVolumes } from "#/world/maps/get-map-floor-volumes"
import type { MapSpace, MapSpaceRegistry } from "#/world/maps/map-space-types"

const rect = { x0: 1, z0: 1, x1: 3, z1: 2 }
const space = (): MapSpace => ({
  parentMap: "root",
  frame: { origin: [10, 3, 20], width: 4, depth: 4, quarterTurns: 0 },
  planarOrigin: [100, 200],
  metresPerPlanarUnit: 8,
  floor: { thicknessMetres: 0.25, footprint: [rect] },
})
const registry = (placement: MapSpace): MapSpaceRegistry => ({ root: { id: "root" }, inside: { id: "inside", space: placement } })
it("projects both floor faces in metres without applying display scale", () => {
  const maps = registry(space()),
    before = structuredClone(maps)
  expect(getMapFloorVolumes(maps, "inside")).toEqual([{ mapId: "inside", rootSpace: "root", undersideElevationMetres: 2.75, floorElevationMetres: 3, bounds: { x0: 11, z0: 21, x1: 13, z1: 22 } }])
  expect(maps).toEqual(before)
})
it.each([0, 1, 2, 3])("preserves material volume after quarter turn %s", (quarterTurns) => {
  const placement = space(),
    volume = getMapFloorVolumes(registry({ ...placement, frame: { ...placement.frame, quarterTurns } }), "inside")[0]
  expect((volume.bounds.x1 - volume.bounds.x0) * (volume.bounds.z1 - volume.bounds.z0) * (volume.floorElevationMetres - volume.undersideElevationMetres)).toBe(0.5)
})
it.each([0, -1, NaN, Infinity])("rejects invalid floor thickness %s", (thicknessMetres) => {
  expect(() => getMapFloorVolumes(registry({ ...space(), floor: { thicknessMetres, footprint: [rect] } }), "inside")).toThrow("Invalid map floor thickness")
})
it("does not infer a solid for absent floor data or an unplaced map", () => {
  expect(getMapFloorVolumes(registry({ ...space(), floor: undefined }), "inside")).toEqual([])
  expect(getMapFloorVolumes({ unknown: { id: "unknown" } }, "unknown")).toEqual([])
})
it("rejects malformed floor data rather than treating it as unknown geometry", () => {
  const placement = space()
  Reflect.set(placement, "floor", null)
  expect(() => getMapFloorVolumes(registry(placement), "inside")).toThrow("Invalid map floor geometry")
})
it("rejects overlapping material strips", () => {
  expect(() => getMapFloorVolumes(registry({ ...space(), floor: { thicknessMetres: 0.25, footprint: [rect, rect] } }), "inside")).toThrow("Map floor strips overlap")
})
it.each([
  { ...rect, x0: -1 },
  { ...rect, x1: 5 },
  { ...rect, z1: NaN },
  { ...rect, z1: 1 },
])("rejects invalid floor footprint %j", (bounds) => {
  expect(() => getMapFloorVolumes(registry({ ...space(), floor: { thicknessMetres: 0.25, footprint: [bounds] } }), "inside")).toThrow("Map floor footprint is outside its frame")
})
it("rejects floor thickness lost after ancestor translation", () => {
  const placement = space(),
    maps = registry({ ...placement, parentMap: "parent", frame: { ...placement.frame, origin: [0, 0, 0] } })
  expect(() => getMapFloorVolumes({ ...maps, parent: { id: "parent", space: { ...placement, floor: undefined, frame: { ...placement.frame, origin: [0, 1e16, 0] } } } }, "inside")).toThrow(
    "Map floor volume collapses in parent space",
  )
})
