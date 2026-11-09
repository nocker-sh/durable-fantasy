import { expect, it } from "vitest"
import { assertMapSpaceRegistry } from "#/world/maps/assert-map-space-registry"
import type { MapSpace, MapSpaceRegistry } from "#/world/maps/map-space-types"

const footprint = [{ x0: 0, z0: 0, x1: 4, z1: 4 }]
const space = (height: number): MapSpace => ({ parentMap: "root", frame: { origin: [0, height, 0], width: 4, depth: 4, quarterTurns: 0 }, planarOrigin: [0, 0], metresPerPlanarUnit: 1 })
const floor = { thicknessMetres: 0.25, footprint }
const registry = (height: number): MapSpaceRegistry => ({
  root: { id: "root" },
  room: { id: "room", space: { ...space(0), rooms: [{ id: "room", heightMetres: 2, footprint }] } },
  slab: { id: "slab", space: { ...space(height), floor } },
})
it("rejects a slab that pierces a room even when its walking floor is above that room's ceiling", () => {
  const maps = registry(2.125),
    before = structuredClone(maps)
  expect(() => assertMapSpaceRegistry(maps)).toThrow("Map floor intersects room")
  expect(maps).toEqual(before)
})
it("allows exact contact between a room ceiling and the underside of a floor", () => {
  expect(() => assertMapSpaceRegistry(registry(2.25))).not.toThrow()
})
it("rejects overlapping floors even without known room heights", () => {
  expect(() => assertMapSpaceRegistry({ root: { id: "root" }, a: { id: "a", space: { ...space(2), floor } }, b: { id: "b", space: { ...space(2.125), floor } } })).toThrow("Map floors overlap")
})
it("allows face-to-face floor contact without double occupancy", () => {
  expect(() => assertMapSpaceRegistry({ root: { id: "root" }, a: { id: "a", space: { ...space(2), floor } }, b: { id: "b", space: { ...space(2.25), floor } } })).not.toThrow()
})
it("does not compare floor material against rooms in a different unplaced root", () => {
  const maps = registry(1),
    slab = maps.slab.space
  if (!slab) throw new Error("Missing slab")
  expect(() => assertMapSpaceRegistry({ ...maps, other: { id: "other" }, slab: { id: "slab", space: { ...slab, parentMap: "other" } } })).not.toThrow()
})
it("does not fill a floor opening when checking a room passing through it", () => {
  const strips = [
    { x0: 0, z0: 0, x1: 4, z1: 1 },
    { x0: 0, z0: 3, x1: 4, z1: 4 },
    { x0: 0, z0: 1, x1: 1, z1: 3 },
    { x0: 3, z0: 1, x1: 4, z1: 3 },
  ]
  expect(() =>
    assertMapSpaceRegistry({
      root: { id: "root" },
      room: { id: "room", space: { ...space(0), rooms: [{ id: "opening", heightMetres: 2, footprint: [{ x0: 1, z0: 1, x1: 3, z1: 3 }] }] } },
      slab: { id: "slab", space: { ...space(1), floor: { ...floor, footprint: strips } } },
    }),
  ).not.toThrow()
})
