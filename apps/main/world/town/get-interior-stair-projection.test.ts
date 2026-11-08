import { expect, it } from "vitest"
import { getInteriorStairProjection } from "#/world/town/get-interior-stair-projection"
import type { StairSection } from "#/world/town/floorplan/stair-geometry"

const section: StairSection = {
  id: "stair",
  x0: 0,
  z0: 0,
  x1: 2,
  z1: 6,
  lowerFloor: 0,
  upperFloor: 1,
  height: 3,
  slabThickness: 0.2,
  risers: 4,
  going: 1,
  axis: "z",
  lowerEnd: "start",
  landing: 1,
  clearWidth: 1,
  railInset: 0.25,
  openingLength: 2,
}
it("projects the lower flight and all physical dimensions once", () => {
  const original = structuredClone(section)
  const result = getInteriorStairProjection({ sections: [section], floor: 0, x0: 10, z0: 20, scale: 2 })
  expect(result.stairSections).toEqual([{ ...section, x0: 10, z0: 20, x1: 14, z1: 32, height: 6, slabThickness: 0.4, going: 2, landing: 2, clearWidth: 2, railInset: 0.5, openingLength: 4 }])
  expect(result.floorOpenings).toEqual([])
  expect(result.stairBlocks).toEqual([{ x0: 10, x1: 14, z0: 24, z1: 30 }])
  expect(section).toEqual(original)
})
it("cuts the upper opening and uses that same geometry for the collision block", () => {
  const result = getInteriorStairProjection({ sections: [section], floor: 1, x0: 10, z0: 20, scale: 2 })
  expect(result.floorOpenings).toEqual([{ x0: 10, x1: 14, z0: 26, z1: 30 }])
  expect(result.stairBlocks).toEqual(result.floorOpenings)
})
