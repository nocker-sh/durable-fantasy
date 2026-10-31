import { expect, it } from "vitest"
import { getApproachCandidates } from "#/world/scene/runtime/get-approach-candidates"

it("searches the near side then alternates sides before expanding its radius", () => {
  const points = [...getApproachCandidates({ from: [2, 0], at: [0, 0], radii: [1, 2] })]
  expect(points).toHaveLength(16)
  expect(points[0]).toEqual([1, 0])
  expect(points[1][0]).toBeCloseTo(Math.SQRT1_2)
  expect(points[1][1]).toBeCloseTo(Math.SQRT1_2)
  expect(points[2][0]).toBeCloseTo(Math.SQRT1_2)
  expect(points[2][1]).toBeCloseTo(-Math.SQRT1_2)
  expect(points[8]).toEqual([2, 0])
})

it("remains finite when the resident and player coincide", () => {
  const points = [...getApproachCandidates({ from: [3, 4], at: [3, 4], radii: [1], normalize: true })]
  expect(points).toHaveLength(8)
  expect(points.flat().every(Number.isFinite)).toBe(true)
  expect(points[0]).toEqual([4, 4])
})
