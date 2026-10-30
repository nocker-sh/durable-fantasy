import { expect, it } from "vitest"
import generated from "#/world/town/floorplan/authored/h-m5"
import { assertAuthoredPlanDimensions } from "#/world/town/floorplan/assert-authored-plan-dimensions"

it("accepts a positive scale and complete integer dimensions", () => {
  expect(() => assertAuthoredPlanDimensions(generated)).not.toThrow()
})

it("rejects invalid grid dimensions before entrance sizes", () => {
  for (const field of ["width", "depth", "floors"]) {
    for (const value of [0, -1, 1.5, NaN, Infinity]) expect(() => assertAuthoredPlanDimensions({ ...generated, [field]: value })).toThrow("Invalid authored plan dimensions")
  }
  expect(() => assertAuthoredPlanDimensions({ ...generated, cellM: 0, entryHeight: 0, entryWidth: 0 })).toThrow("Invalid authored plan dimensions")
  expect(() => assertAuthoredPlanDimensions({ ...generated, entryHeight: 0, entryWidth: 0 })).toThrow("Invalid authored entrance height")
  expect(() => assertAuthoredPlanDimensions({ ...generated, entryWidth: 0 })).toThrow("Invalid authored entrance width")
})
