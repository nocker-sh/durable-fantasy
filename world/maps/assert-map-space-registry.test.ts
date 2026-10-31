import { expect, it } from "vitest"
import { MAPS } from "#/world/maps"
import { assertMapSpaceRegistry } from "#/world/maps/assert-map-space-registry"
import type { MapDefinition } from "#/world/maps/types"
import type { MapSpace } from "#/world/maps/map-space-types"

type Maps = Record<string, Pick<MapDefinition, "id" | "space">>
const space = (parentMap: string): MapSpace => ({ parentMap, frame: { origin: [1, 0, 2], width: 8, depth: 6, quarterTurns: 0 }, planarOrigin: [10, 20], metresPerPlanarUnit: 0.5 })
const fixture = (): Maps => ({ outside: { id: "outside" }, lower: { id: "lower", space: space("outside") }, upper: { id: "upper", space: space("outside") } })
it("accepts the actual registry and preserves known and unknown placements", () => {
  const maps = fixture(),
    original = structuredClone(maps)
  expect(() => assertMapSpaceRegistry(MAPS)).not.toThrow()
  expect(() => assertMapSpaceRegistry(maps)).not.toThrow()
  expect(maps).toEqual(original)
  expect(maps.outside.space).toBeUndefined()
})
it("rejects a missing parent even when another map has that id under the wrong key", () => {
  const maps = fixture()
  delete maps.outside
  maps.misplaced = { id: "outside" }
  expect(() => assertMapSpaceRegistry(maps)).toThrow(/Map space/)
})
it.each(["self", "pair", "long"])("rejects a %s parent cycle", (cycle) => {
  const maps = fixture()
  maps.lower.space = space(cycle === "self" ? "lower" : "upper")
  maps.upper.space = space(cycle === "long" ? "outside" : "lower")
  if (cycle === "long") maps.outside.space = space("lower")
  expect(() => assertMapSpaceRegistry(maps)).toThrow(/Map space/)
})
it.each(["origin", "dimensions", "rotation", "planar-origin", "scale", "zero-scale"])("rejects invalid %s metadata at registration", (invalid) => {
  const maps = fixture(),
    placement = space("outside")
  maps.lower.space = {
    ...placement,
    frame: { ...placement.frame, origin: invalid === "origin" ? [Infinity, 0, 0] : placement.frame.origin, width: invalid === "dimensions" ? 0 : 8, quarterTurns: invalid === "rotation" ? 4 : 0 },
    planarOrigin: invalid === "planar-origin" ? [NaN, 0] : placement.planarOrigin,
    metresPerPlanarUnit: invalid === "scale" ? Infinity : invalid === "zero-scale" ? 0 : 0.5,
  }
  expect(() => assertMapSpaceRegistry(maps)).toThrow(/Map space/)
})
it("accepts an acyclic chain without treating unknown roots as placed", () => {
  const maps = fixture()
  maps.upper.space = space("lower")
  expect(() => assertMapSpaceRegistry(maps)).not.toThrow()
  expect(maps.outside.space).toBeUndefined()
})

it("does not resolve inherited object properties as registered parents", () => {
  const maps = fixture()
  maps.lower.space = space("constructor")
  expect(() => assertMapSpaceRegistry(maps)).toThrow("Map space parent is missing")
})
it("rejects a key that differs from its declared map id", () => {
  const maps = fixture()
  maps.lower.id = "wrong-id"
  expect(() => assertMapSpaceRegistry(maps)).toThrow("Map space parent is missing or miskeyed")
})
it("rejects overlapping physical room strips through the actual registration guard", () => {
  const maps = fixture(),
    placement = space("outside"),
    rect = { x0: 1, z0: 1, x1: 2, z1: 2 }
  maps.lower.space = {
    ...placement,
    rooms: [
      { id: "a", footprint: [rect] },
      { id: "b", footprint: [rect] },
    ],
  }
  expect(() => assertMapSpaceRegistry(maps)).toThrow("Map room footprints overlap: a / b")
})
it("rejects coincident room interiors across different maps in the same parent plane", () => {
  const maps = fixture(),
    rect = { x0: 1, z0: 1, x1: 3, z1: 2 }
  maps.lower.space = { ...space("outside"), rooms: [{ id: "lower-room", footprint: [rect] }] }
  maps.upper.space = { ...space("outside"), rooms: [{ id: "upper-room", footprint: [rect] }] }
  expect(() => assertMapSpaceRegistry(maps)).toThrow("Map room planes overlap")
})
it("rejects a duplicate of an actual placed indoor map", () => {
  const original = Object.values(MAPS).find((map) => map.space?.rooms?.length)
  if (!original) throw new Error("Missing known room geometry")
  const duplicate = { ...original, id: "duplicate-physical-room" }
  expect(() => assertMapSpaceRegistry({ ...MAPS, [duplicate.id]: duplicate })).toThrow("Map room planes overlap")
})
