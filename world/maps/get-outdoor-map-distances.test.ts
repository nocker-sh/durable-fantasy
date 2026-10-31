import { expect, it } from "vitest"
import { getOutdoorMapDistances } from "#/world/maps/get-outdoor-map-distances"
import type { MapDefinition } from "#/world/maps/types"

const map = (id: string, destinations: readonly string[]): MapDefinition => ({
  id,
  name: id,
  kind: "town",
  size: 1,
  rows: ["."],
  spawn: [0, 0],
  places: {},
  npcs: [],
  assets: { sprites: "" },
  warps: destinations.map((destination) => ({ at: [0, 0], to: { map: destination, at: [0, 0] } })),
})
it("counts the shortest crossing route through cycles without changing declared links", () => {
  const maps = { town: map("town", ["near", "far"]), near: map("near", ["town", "end"]), far: map("far", ["end"]), end: map("end", ["near"]), isolated: map("isolated", []) },
    before = structuredClone(maps)
  expect([...getOutdoorMapDistances(maps, "town")]).toEqual([
    ["town", 0],
    ["near", 1],
    ["far", 1],
    ["end", 2],
  ])
  expect(maps).toEqual(before)
})
it("reports a missing destination instead of reading an undefined map", () => {
  expect(() => getOutdoorMapDistances({ town: map("town", ["missing"]) }, "town")).toThrow("Outdoor connection has no map: missing")
})
it("does not treat inherited object attributes as maps", () => {
  expect(() => getOutdoorMapDistances({ town: map("town", ["constructor"]) }, "town")).toThrow("Outdoor connection has no map: constructor")
})
