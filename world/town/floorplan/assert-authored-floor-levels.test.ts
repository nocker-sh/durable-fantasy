import { expect, it } from "vitest"
import { assertAuthoredFloorLevels } from "#/world/town/floorplan/assert-authored-floor-levels"
import type { AuthoredPlan } from "#/world/town/floorplan/authored-types"

it("keeps valid unordered floors and their source values unchanged", () => {
  const levels: AuthoredPlan["floorLevels"] = [
    { floor: 1, elevation: 2.52, ceiling: 4.9, thickness: 0.2 },
    { floor: 0, elevation: 0, ceiling: 2.32, thickness: 0.35 },
  ]
  const original = structuredClone(levels)
  expect(() => assertAuthoredFloorLevels(levels, 2)).not.toThrow()
  expect(levels).toEqual(original)
})
it("rejects an overflowing room height made from finite elevations", () => {
  expect(() => assertAuthoredFloorLevels([{ floor: 0, elevation: -Number.MAX_VALUE, ceiling: Number.MAX_VALUE, thickness: 0.2 }], 1)).toThrow("floor thickness")
})
it("rejects an overflowing floor underside made from finite elevations", () => {
  expect(() => assertAuthoredFloorLevels([{ floor: 0, elevation: -Number.MAX_VALUE, ceiling: 0, thickness: Number.MAX_VALUE }], 1)).toThrow("floor thickness")
})
it("rejects thickness that collapses at the authored coordinate magnitude", () => {
  expect(() => assertAuthoredFloorLevels([{ floor: 0, elevation: 1e308, ceiling: 1.5e308, thickness: 0.2 }], 1)).toThrow("floor thickness")
})
it("does not lose a floor gap when subtracting a very large ceiling first", () => {
  const levels = [
    { floor: 0, elevation: -1.5e308, ceiling: -1e308, thickness: 1e307 },
    { floor: 1, elevation: 1, ceiling: 3, thickness: 1e308 },
  ]
  expect(() => assertAuthoredFloorLevels(levels, 2)).toThrow("floor thickness")
})
it("does not lose a ceiling overlap when adding a very large thickness first", () => {
  const levels = [
    { floor: 0, elevation: -1, ceiling: 1, thickness: 0.2 },
    { floor: 1, elevation: 1e308, ceiling: 1.5e308, thickness: 1e308 },
  ]
  expect(() => assertAuthoredFloorLevels(levels, 2)).toThrow("floor thickness")
})
it("does not accept an empty building as having complete floor levels", () => {
  expect(() => assertAuthoredFloorLevels([], 0)).toThrow("floor levels are incomplete")
})

it.each([
  {
    levels: [
      { floor: 0, elevation: 0, ceiling: 2.32, thickness: 0.2 },
      { floor: 0, elevation: 2.52, ceiling: 4.9, thickness: 0.2 },
    ],
  },
  {
    levels: [
      { floor: 0, elevation: 0, ceiling: 2.32, thickness: 0.2 },
      { floor: 2, elevation: 2.52, ceiling: 4.9, thickness: 0.2 },
    ],
  },
  {
    levels: [
      { floor: 0.5, elevation: 0, ceiling: 2.32, thickness: 0.2 },
      { floor: 1, elevation: 2.52, ceiling: 4.9, thickness: 0.2 },
    ],
  },
])("rejects invalid floor registration independently of height values: %j", (invalid) => {
  expect(() => assertAuthoredFloorLevels(invalid.levels, 2)).toThrow("floor thickness")
})
