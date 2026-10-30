import { expect, it } from "vitest"
import { getSegmentCuboidIntervalMinimum } from "#/lib/engine/get-segment-cuboid-interval-minimum"

it("finds the stationary minimum between consecutive face crossings", () => {
  expect(getSegmentCuboidIntervalMinimum({ query: { low: [0, 0, 0], high: [1, 1, 1], origin: [-2, 5, 2], delta: [7, -7, 0] }, start: 3 / 7, end: 4 / 7 })).toBeCloseTo(1.5, 12)
})

it("clamps a stationary point outside the interval to its nearest endpoint", () => {
  expect(getSegmentCuboidIntervalMinimum({ query: { low: [0, 0, 0], high: [1, 1, 1], origin: [-2, 2, 0.5], delta: [1, 0, 0] }, start: 0, end: 1 })).toBe(2)
})

it("keeps constant distances and repeated crossings well defined", () => {
  expect(getSegmentCuboidIntervalMinimum({ query: { low: [0, 0, 0], high: [1, 1, 1], origin: [2, 3, 4], delta: [0, 0, 0] }, start: 0.5, end: 0.5 })).toBe(14)
  expect(getSegmentCuboidIntervalMinimum({ query: { low: [0, 0, 0], high: [1, 1, 1], origin: [0.5, 0.5, 0.5], delta: [0, 0, 0] }, start: 0, end: 1 })).toBe(0)
})
