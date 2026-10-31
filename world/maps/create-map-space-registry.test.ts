import { expect, it } from "vitest"
import { createMapSpaceRegistry } from "#/world/maps/create-map-space-registry"
import { assertMapSpaceRegistry } from "#/world/maps/assert-map-space-registry"
import { getMapSpaceTransform } from "#/world/maps/get-map-space-transform"
import { getMapSpacePoint } from "#/world/maps/get-map-space-point"
import { WORLD_SPACE_ROOT } from "#/world/maps/world-space-rules"
import { MAPS } from "#/world/maps"
import { WORLD } from "#/world/maps/grid"
import { TILE_M } from "#/world/town/fit"
import type { MapDefinition } from "#/world/maps/types"
import type { Square } from "#/world/maps/grid-types"

const fixture = (id: string): MapDefinition => ({
  id,
  name: id,
  kind: "field",
  size: 4,
  rows: ["....", "....", "....", "...."],
  spawn: [1, 1],
  places: {},
  npcs: [],
  warps: [],
  assets: { sprites: "" },
})
const squares: readonly Square[] = [
  { at: [0, 0], map: "a" },
  { at: [1, 0], map: "b" },
]

it("places every existing outdoor map in one metric root without changing playable definitions", () => {
  const before = structuredClone(MAPS),
    registry = createMapSpaceRegistry(MAPS)
  expect(() => assertMapSpaceRegistry(registry)).not.toThrow()
  expect(Object.keys(registry)).toHaveLength(Object.keys(MAPS).length + 1)
  expect(MAPS).toEqual(before)
  expect(MAPS[WORLD_SPACE_ROOT]).toBeUndefined()
  for (const map of Object.values(MAPS).filter((map) => map.kind !== "indoor")) {
    const square = WORLD.find((square) => square.map === map.id)
    if (!square) throw new Error("Missing outdoor fixture square")
    const placement = getMapSpaceTransform(registry, map.id),
      span = (map.size / 2) * TILE_M
    expect(placement.rootSpace).toBe(WORLD_SPACE_ROOT)
    expect(placement.transform.toWorld([0, 7, 0])).toEqual([square.at[0] * span, 7, square.at[1] * span])
    expect(placement.transform.toLocal(placement.transform.toWorld([3, 7, 4]))).toEqual([3, 7, 4])
  }
})
it("joins adjacent metric boundaries and converts planar units exactly once", () => {
  const registry = createMapSpaceRegistry({ a: fixture("a"), b: fixture("b") }, squares),
    a = registry.a.space,
    b = registry.b.space
  if (!a || !b) throw new Error("Missing space fixture")
  expect(getMapSpacePoint({ space: a, point: [2, 1], heightMetres: 3 })).toEqual(getMapSpacePoint({ space: b, point: [0, 1], heightMetres: 3 }))
  expect(a.frame.origin[0] + a.frame.width).toBe(b.frame.origin[0])
})
it("keeps all registered outdoor rectangles separate, allowing shared boundaries", () => {
  const registry = createMapSpaceRegistry(MAPS),
    spaces = Object.values(MAPS)
      .filter((map) => map.kind !== "indoor")
      .map((map) => registry[map.id].space)
  for (const first of spaces)
    for (const second of spaces) {
      if (!first || !second) throw new Error("Missing outdoor space")
      if (first === second) continue
      const a = first.frame,
        b = second.frame
      expect(a.origin[0] < b.origin[0] + b.width && a.origin[0] + a.width > b.origin[0] && a.origin[2] < b.origin[2] + b.depth && a.origin[2] + a.depth > b.origin[2]).toBe(false)
    }
})
it("carries authored indoor rooms through the outdoor frame while leaving unknown interiors unplaced", () => {
  const registry = createMapSpaceRegistry(MAPS)
  for (const map of Object.values(MAPS).filter((map) => map.kind === "indoor")) {
    if (!map.space) {
      expect(registry[map.id].space).toBeUndefined()
      expect(getMapSpaceTransform(registry, map.id).rootSpace).toBe(map.id)
      continue
    }
    expect(registry[map.id].space).toEqual(map.space)
    const placement = getMapSpaceTransform(registry, map.id),
      parent = registry[map.space.parentMap].space
    if (!parent) throw new Error("Missing outdoor parent")
    const origin = getMapSpaceTransform(MAPS, map.id).transform.toWorld([0, 0, 0])
    expect(placement.rootSpace).toBe(WORLD_SPACE_ROOT)
    expect(placement.transform.toWorld([0, 0, 0])).toEqual([parent.frame.origin[0] + origin[0], origin[1], parent.frame.origin[2] + origin[2]])
  }
})
it("detects room overlap across outdoor parents after their placement in one root", () => {
  const roomSpace = (parentMap: string, x: number) => ({
    parentMap,
    frame: { origin: [x, 0, 1] satisfies readonly [number, number, number], width: 1, depth: 1, quarterTurns: 0 },
    planarOrigin: [0, 0] satisfies readonly [number, number],
    metresPerPlanarUnit: 1,
    rooms: [{ id: parentMap + "-room", footprint: [{ x0: 0, z0: 0, x1: 1, z1: 1 }] }],
  })
  const maps: Record<string, MapDefinition> = {
    a: fixture("a"),
    b: fixture("b"),
    insideA: { ...fixture("insideA"), kind: "indoor", space: roomSpace("a", 1) },
    insideB: { ...fixture("insideB"), kind: "indoor", space: roomSpace("b", 1 - 2 * TILE_M) },
  }
  expect(() => assertMapSpaceRegistry(maps)).not.toThrow()
  expect(() => assertMapSpaceRegistry(createMapSpaceRegistry(maps, squares))).toThrow("Map room planes overlap")
})
it("rejects different outdoor spans rather than shifting a shared boundary", () => {
  expect(() => createMapSpaceRegistry({ a: fixture("a"), b: { ...fixture("b"), size: 6 } }, squares)).toThrow("different sizes")
})
it("rejects a missing square, miskeyed map, root collision, and conflicting authored placement", () => {
  expect(() => createMapSpaceRegistry({ c: fixture("c") }, squares)).toThrow("square is missing")
  expect(() => createMapSpaceRegistry({ a: fixture("b") }, squares)).toThrow("miskeyed")
  expect(() => createMapSpaceRegistry({ [WORLD_SPACE_ROOT]: fixture(WORLD_SPACE_ROOT) }, squares)).toThrow("root conflicts")
  const registry = createMapSpaceRegistry({ a: fixture("a") }, squares)
  expect(() => createMapSpaceRegistry({ a: { ...fixture("a"), space: registry.a.space } }, squares)).toThrow("placement conflicts")
})
it("does not instantiate unbuilt cities or unregistered reserved maps", () => {
  const registry = createMapSpaceRegistry({ a: fixture("a") }, [...squares, { at: [2, 0], city: "未建設" }])
  expect(Object.keys(registry)).toEqual([WORLD_SPACE_ROOT, "a"])
})
