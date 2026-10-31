import { expect, it } from "vitest"
import { INTERIORS } from "#/world/town/interiors"
import { getInteriorStairRegistry } from "#/world/town/get-interior-stair-registry"
import { getInteriorStairEndpoints } from "#/world/town/get-interior-stair-endpoints"

function fixture() {
  const lower = INTERIORS.find((room) => room.floor === 0 && room.stairSections?.length)
  if (!lower) throw new Error("Missing physical stair fixture")
  const upper = INTERIORS.find((room) => room.house.id === lower.house.id && room.floor === 1)
  if (!upper) throw new Error("Missing upper stair fixture")
  return { lower: structuredClone(lower), upper: structuredClone(upper) }
}
it("joins the two views of the same physical flight without changing their definitions", () => {
  const source = fixture(),
    before = JSON.stringify(source)
  const endpoints = getInteriorStairEndpoints(getInteriorStairRegistry([source.lower, source.upper]))
  expect(endpoints).toHaveLength(2)
  expect(endpoints[0].targetAt).toEqual(endpoints[1].at)
  expect(endpoints[1].targetAt).toEqual(endpoints[0].at)
  expect(JSON.stringify(source)).toBe(before)
})
it.each(["missing", "duplicate", "position", "height", "direction", "opening", "rise"])("rejects a mismatched upper-floor stair: %s", (change) => {
  const source = fixture(),
    sections = source.upper.stairSections ?? [],
    section = sections[0]
  if (!section) throw new Error("Missing projected flight")
  source.upper.stairSections = [
    {
      ...section,
      x0: section.x0 + (change === "position" ? 0.1 : 0),
      x1: section.x1 + (change === "position" ? 0.1 : 0),
      height: section.height + (change === "height" ? 0.1 : 0),
      lowerEnd: change === "direction" ? (section.lowerEnd === "start" ? "end" : "start") : section.lowerEnd,
      openingLength: section.openingLength - (change === "opening" ? 0.1 : 0),
      risers: section.risers - (change === "rise" ? 1 : 0),
    },
  ]
  if (change === "missing") source.upper.stairSections = []
  if (change === "duplicate") source.upper.stairSections = [section, section]
  expect(() => getInteriorStairEndpoints(getInteriorStairRegistry([source.lower, source.upper]))).toThrow("Stair floor views disagree")
})
it("rejects a shared stair height that differs from the actual floor elevation", () => {
  const source = fixture()
  for (const room of [source.lower, source.upper]) room.stairSections = room.stairSections?.map((section) => ({ ...section, height: section.height + 0.15 }))
  expect(() => getInteriorStairEndpoints(getInteriorStairRegistry([source.lower, source.upper]))).toThrow("Stair floor elevations disagree")
})

it("rejects an upper flight whose lower-floor view has disappeared", () => {
  const source = fixture()
  source.lower.stairSections = []
  expect(() => getInteriorStairEndpoints(getInteriorStairRegistry([source.lower, source.upper]))).toThrow("Stair floor views disagree")
})
it("rejects a shared slab dimension that differs from the upper floor", () => {
  const source = fixture()
  for (const room of [source.lower, source.upper]) room.stairSections = room.stairSections?.map((section) => ({ ...section, slabThickness: section.slabThickness + 0.03 }))
  expect(() => getInteriorStairEndpoints(getInteriorStairRegistry([source.lower, source.upper]))).toThrow("Stair floor elevations disagree")
})
it("allows a different upper display origin and derives its trigger from that floor's own view", () => {
  const source = fixture(),
    offset = 0.5
  const before = getInteriorStairEndpoints(getInteriorStairRegistry([source.lower, source.upper]))
  source.upper.x0 += offset
  source.upper.x1 += offset
  source.upper.stairSections = source.upper.stairSections?.map((section) => ({ ...section, x0: section.x0 + offset, x1: section.x1 + offset }))
  const after = getInteriorStairEndpoints(getInteriorStairRegistry([source.lower, source.upper]))
  expect(after[0].at).toEqual(before[0].at)
  expect(after[1].at).toEqual([before[1].at[0] + 1, before[1].at[1]])
  expect(after[0].targetAt).toEqual(after[1].at)
})
