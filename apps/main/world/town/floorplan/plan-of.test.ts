import { expect, it } from "vitest"
import { planOf } from "#/world/town/floorplan/plan-of"
import { HOUSES } from "#/world/town/houses"
import template from "#/world/town/floorplan/authored/h-m5"

it.each(["bounds", "rotation", "identity"])("rejects a registered authored site with inconsistent %s", (invalid) => {
  const house = HOUSES.find((house) => house.id === "h-m5")
  if (!house) throw new Error("Missing authored house fixture")
  const source = structuredClone(template)
  if (invalid === "bounds") source.exterior.bounds[2] += 1
  if (invalid === "rotation") source.exterior.quarterTurns = 4
  if (invalid === "identity") source.exterior.id = "different-building"
  expect(() => planOf({ ...house, authored: source })).toThrow(/authored site|exterior dimensions/)
})
