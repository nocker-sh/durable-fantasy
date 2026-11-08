import { expect, it } from "vitest"
import { assertMapSpaceRegistry } from "#/world/maps/assert-map-space-registry"
import type { MapSpace, MapSpaceRegistry } from "#/world/maps/map-space-types"

const room = { id: "room", heightMetres: 2, footprint: [{ x0: 1, z0: 1, x1: 3, z1: 2 }] }
const space = (height: number): MapSpace => ({
  parentMap: "root",
  frame: { origin: [10, height, 20], width: 6, depth: 6, quarterTurns: 0 },
  planarOrigin: [0, 0],
  metresPerPlanarUnit: 1,
  rooms: [room],
})
const registry = (height: number): MapSpaceRegistry => ({ root: { id: "root" }, lower: { id: "lower", space: space(0) }, upper: { id: "upper", space: space(height) } })

it.each([-1.99, -1, 0.001, 1, 1.99])("rejects room interiors that overlap vertically despite distinct floor elevations: %s", (height) => {
  const maps = registry(height),
    original = structuredClone(maps)
  expect(() => assertMapSpaceRegistry(maps)).toThrow("Map room volumes overlap")
  expect(maps).toEqual(original)
})
it.each([-3, -2, 2, 3])("allows vertical separation and exact ceiling-to-floor contact: %s", (height) => {
  expect(() => assertMapSpaceRegistry(registry(height))).not.toThrow()
})
it("allows horizontal boundary contact at overlapping heights", () => {
  const maps = registry(1),
    upper = maps.upper.space
  if (!upper) throw new Error("Missing upper space")
  expect(() => assertMapSpaceRegistry({ ...maps, upper: { id: "upper", space: { ...upper, rooms: [{ ...room, footprint: [{ x0: 3, z0: 1, x1: 4, z1: 2 }] }] } } })).not.toThrow()
})
it("does not infer a ceiling for a room with unknown height", () => {
  const maps = registry(1),
    upper = maps.upper.space
  if (!upper) throw new Error("Missing upper space")
  expect(() => assertMapSpaceRegistry({ ...maps, upper: { id: "upper", space: { ...upper, rooms: [{ id: "unknown", footprint: room.footprint }] } } })).not.toThrow()
})
it("does not compare measured volumes from different unplaced roots", () => {
  const maps = registry(1),
    upper = maps.upper.space
  if (!upper) throw new Error("Missing upper space")
  expect(() => assertMapSpaceRegistry({ ...maps, other: { id: "other" }, upper: { id: "upper", space: { ...upper, parentMap: "other" } } })).not.toThrow()
})
it("preserves the gap in a concave room when extruding its strips", () => {
  const maps = registry(1),
    lower = maps.lower.space,
    upper = maps.upper.space
  if (!lower || !upper) throw new Error("Missing measured spaces")
  expect(() =>
    assertMapSpaceRegistry({
      ...maps,
      lower: { id: "lower", space: { ...lower, rooms: [{ ...room, footprint: [...room.footprint, { x0: 1, z0: 2, x1: 2, z1: 4 }] }] } },
      upper: { id: "upper", space: { ...upper, rooms: [{ ...room, footprint: [{ x0: 2, z0: 2, x1: 3, z1: 4 }] }] } },
    }),
  ).not.toThrow()
})
it.each([0, 1, 2, 3])("checks measured volumes after quarter turn %s", (quarterTurns) => {
  const maps = registry(1),
    upper = maps.upper.space
  if (!upper) throw new Error("Missing upper space")
  const square = [{ x0: 0, z0: 0, x1: 6, z1: 6 }]
  expect(() => assertMapSpaceRegistry({ ...maps, upper: { id: "upper", space: { ...upper, frame: { ...upper.frame, quarterTurns }, rooms: [{ ...room, footprint: square }] } } })).toThrow(
    "Map room volumes overlap",
  )
})
