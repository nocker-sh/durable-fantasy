import { expect, it } from "vitest"
import { getSpotCell } from "#/world/maps/get-spot-cell"
import type { Cell } from "#/world/maps/types"

it.each(["constructor", "toString", "__proto__"])("does not resolve inherited %s attributes as named coordinates", (name) => {
  expect(getSpotCell({ spot: { map: "map", place: name }, places: {} })).toBeNull()
})
it("keeps an explicitly registered own coordinate even when its name matches an object attribute", () => {
  expect(getSpotCell({ spot: { map: "map", place: "constructor" }, places: { constructor: [1, 2] satisfies Cell } })).toEqual([1, 2])
})
it("preserves direct cells and the existing tile rounding", () => {
  expect(getSpotCell({ spot: { map: "map", cell: [1, 2] }, places: null })).toEqual([1, 2])
  expect(getSpotCell({ spot: { map: "map", tile: [1.25, 2.75] }, places: null })).toEqual([2, 5])
})
it("returns no coordinate for an absent table or name", () => {
  expect(getSpotCell({ spot: { map: "map", place: "missing" }, places: null })).toBeNull()
  expect(getSpotCell({ spot: { map: "map", place: "missing" }, places: {} })).toBeNull()
})
