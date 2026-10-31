import { expect, it } from "vitest"
import { assertMapSpaceRegistry } from "#/world/maps/assert-map-space-registry"
import { createMapSpaceRegistry } from "#/world/maps/create-map-space-registry"
import { MAPS } from "#/world/maps"
import type { MapSpace } from "#/world/maps/map-space-types"

const fixture = (origin: readonly [number, number, number], quarterTurns = 0) => ({
  outside: { id: "outside", bounds: { x0: 0, z0: 0, x1: 10, z1: 8 } },
  inside: { id: "inside", space: { parentMap: "outside", frame: { origin, width: 4, depth: 2, quarterTurns }, planarOrigin: [100, 200], metresPerPlanarUnit: 0.5 } satisfies MapSpace },
})

it.each([
  { origin: [-1, 0, 1], side: "west" },
  { origin: [7, 0, 1], side: "east" },
  { origin: [1, 0, -1], side: "north" },
  { origin: [1, 0, 7], side: "south" },
] satisfies readonly { origin: readonly [number, number, number]; side: string }[])("rejects an interior crossing the parent's $side edge", (input) => {
  expect(() => assertMapSpaceRegistry(fixture(input.origin))).toThrow("Map space extends outside parent: inside -> outside")
})
it.each([0, 1, 2, 3])("accepts boundary contact after quarter turn %s without scaling height or planar metadata", (turn) => {
  const maps = fixture(turn % 2 ? [8, 37, 4] : [6, 37, 6], turn),
    before = structuredClone(maps)
  expect(() => assertMapSpaceRegistry(maps)).not.toThrow()
  expect(maps).toEqual(before)
})
it("uses the rotated extent rather than the unrotated depth", () => {
  expect(() => assertMapSpaceRegistry(fixture([0, 0, 5], 1))).toThrow("Map space extends outside parent")
})
it("accepts the actual world registry without fabricating bounds for unplaced interiors", () => {
  const registry = createMapSpaceRegistry(MAPS),
    before = structuredClone(registry)
  expect(() => assertMapSpaceRegistry(registry)).not.toThrow()
  expect(registry).toEqual(before)
  for (const entry of Object.values(registry)) {
    if (!entry.space) expect(entry.bounds).toBeUndefined()
    else expect(entry.bounds).toEqual({ x0: 0, z0: 0, x1: entry.space.frame.width, z1: entry.space.frame.depth })
  }
})
it("rejects a displaced actual indoor frame through the assembled world's registration guard", () => {
  const original = Object.values(MAPS).find((map) => map.space)
  if (!original?.space) throw new Error("Missing authored interior fixture")
  const space = original.space,
    maps = { ...MAPS, [original.id]: { ...original, space: { ...space, frame: { ...space.frame, origin: [1000, space.frame.origin[1], 1000] satisfies readonly [number, number, number] } } } }
  expect(() => assertMapSpaceRegistry(maps)).not.toThrow()
  expect(() => assertMapSpaceRegistry(createMapSpaceRegistry(maps))).toThrow("Map space extends outside parent")
})
it("does not infer containment from an unbounded reference frame", () => {
  const maps = fixture([100, 0, 200])
  expect(() => assertMapSpaceRegistry({ outside: { id: "outside" }, inside: maps.inside })).not.toThrow()
})
it.each([NaN, Infinity, 0, -1])("rejects an invalid explicit parent boundary %s", (edge) => {
  const maps = fixture([1, 0, 1])
  maps.outside.bounds.x1 = edge
  expect(() => assertMapSpaceRegistry(maps)).toThrow("Invalid map space bounds: outside")
})
it("rejects a claimed local domain larger than its own frame", () => {
  const maps = fixture([1, 0, 1])
  expect(() => assertMapSpaceRegistry({ ...maps, inside: { ...maps.inside, bounds: { x0: 0, z0: 0, x1: 5, z1: 2 } } })).toThrow("Map space bounds exceed local frame: inside")
})
it("compares against the parent's local domain before its own rotation and translation", () => {
  const maps = fixture([6, 37, 6]),
    space: MapSpace = { parentMap: "root", frame: { origin: [1000, 7, -30], width: 10, depth: 8, quarterTurns: 1 }, planarOrigin: [-100, 80], metresPerPlanarUnit: 3 }
  expect(() => assertMapSpaceRegistry({ ...maps, root: { id: "root" }, outside: { ...maps.outside, space } })).not.toThrow()
})
it("keeps explicit offset bounds rather than treating every parent as starting at zero", () => {
  const maps = fixture([6, 0, 6])
  maps.outside.bounds = { x0: 5, z0: 5, x1: 10, z1: 8 }
  expect(() => assertMapSpaceRegistry(maps)).not.toThrow()
  expect(() => assertMapSpaceRegistry({ ...maps, inside: fixture([4, 0, 6]).inside })).toThrow("Map space extends outside parent")
})
