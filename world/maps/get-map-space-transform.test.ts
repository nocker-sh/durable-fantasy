import { expect, it } from "vitest"
import { getMapSpaceTransform } from "#/world/maps/get-map-space-transform"
import type { MapSpace, MapSpaceRegistry } from "#/world/maps/map-space-types"

type Maps = Record<string, MapSpaceRegistry[string]>
const space = (parentMap: string): MapSpace => ({ parentMap, frame: { origin: [1, 2, 1], width: 2, depth: 2, quarterTurns: 0 }, planarOrigin: [10, 20], metresPerPlanarUnit: 0.5 })
const fixture = (): Maps => ({
  root: { id: "root" },
  wing: { id: "wing", space: { ...space("root"), frame: { origin: [100, 5, 200], width: 8, depth: 6, quarterTurns: 1 }, planarOrigin: [-50, 1000], metresPerPlanarUnit: 3 } },
  inside: { id: "inside", space: space("wing") },
})
it("resolves a physical point and its inverse through parents without applying display scales", () => {
  const maps = fixture(),
    original = structuredClone(maps),
    placement = getMapSpaceTransform(maps, "inside")
  expect(placement.rootSpace).toBe("root")
  expect(placement.transform.toWorld([0, 0, 0])).toEqual([101, 7, 207])
  expect(placement.transform.toLocal([103, 7, 205])).toEqual([2, 0, 2])
  expect(maps).toEqual(original)
})
it("leaves an unplaced root explicitly named and local", () => {
  const maps = fixture(),
    placement = getMapSpaceTransform(maps, "root")
  expect(placement.rootSpace).toBe("root")
  expect(placement.transform.toWorld([10, 20, 30])).toEqual([10, 20, 30])
  expect(maps.root.space).toBeUndefined()
})
it("captures frame values independently from later registry changes", () => {
  const maps = fixture(),
    placement = getMapSpaceTransform(maps, "inside"),
    parent = maps.wing.space
  if (!parent) throw new Error("Missing parent fixture")
  Object.assign(parent.frame, { origin: [0, 0, 0] })
  expect(placement.transform.toWorld([0, 0, 0])).toEqual([101, 7, 207])
})
it.each(["missing-map", "missing-parent", "miskeyed", "inherited", "cycle"])("rejects a %s while resolving a standalone transform", (invalid) => {
  const maps = fixture()
  if (invalid === "missing-parent") delete maps.wing
  if (invalid === "miskeyed") maps.wing = { id: "wrong-id" }
  if (invalid === "inherited") maps.inside = { id: "inside", space: space("constructor") }
  if (invalid === "cycle") maps.wing = { id: "wing", space: space("inside") }
  expect(() => getMapSpaceTransform(maps, invalid === "missing-map" ? "missing" : "inside")).toThrow(/Map space parent/)
})
it("reports the actual ancestor when its metric frame is invalid", () => {
  const maps = fixture(),
    parent = maps.wing.space
  if (!parent) throw new Error("Missing parent fixture")
  maps.wing = { id: "wing", space: { ...parent, frame: { ...parent.frame, quarterTurns: 4 } } }
  expect(() => getMapSpaceTransform(maps, "inside")).toThrow("Map space frame is invalid: wing")
})
it("traverses long chains iteratively in both directions", () => {
  const maps: Maps = { root: { id: "root" } }
  for (const index of Array.from({ length: 1000 }, (_, index) => index))
    maps[`map-${index}`] = { id: `map-${index}`, space: { ...space(index === 0 ? "root" : `map-${index - 1}`), frame: { origin: [1, 1, 1], width: 2, depth: 2, quarterTurns: 0 } } }
  const placement = getMapSpaceTransform(maps, "map-999")
  expect(placement.rootSpace).toBe("root")
  expect(placement.transform.toWorld([0, 0, 0])).toEqual([1000, 1000, 1000])
  expect(placement.transform.toLocal([1000, 1000, 1000])).toEqual([0, 0, 0])
})
