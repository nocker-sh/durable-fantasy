import { expect, it } from "vitest"
import { segmentSegmentDistance } from "#/lib/engine/segment-segment-distance"
import { segmentRectDistance } from "#/lib/engine/segment-rect-distance"
import { segmentIntersectsRect } from "#/lib/engine/segment-intersects-rect"
it("detects crossing diagonals and is independent of segment order", () => {
  const a = [0, 0],
    b = [10, 10],
    c = [0, 10],
    d = [10, 0]
  expect(segmentSegmentDistance({ from: a, to: b, otherFrom: c, otherTo: d })).toBe(0)
  expect(segmentSegmentDistance({ from: d, to: c, otherFrom: b, otherTo: a })).toBe(0)
})
it("measures parallel banks, disjoint collinear lines, and overlapping lines", () => {
  expect(segmentSegmentDistance({ from: [0, 0], to: [10, 0], otherFrom: [0, 2], otherTo: [10, 2] })).toBe(2)
  expect(segmentSegmentDistance({ from: [0, 0], to: [1, 0], otherFrom: [3, 0], otherTo: [4, 0] })).toBe(2)
  expect(segmentSegmentDistance({ from: [0, 0], to: [3, 0], otherFrom: [1, 0], otherTo: [4, 0] })).toBe(0)
})
it("handles point segments and nearest endpoints", () => {
  expect(segmentSegmentDistance({ from: [0, 0], to: [0, 0], otherFrom: [3, 4], otherTo: [3, 4] })).toBe(5)
  expect(segmentSegmentDistance({ from: [0, 0], to: [1, 0], otherFrom: [2, 1], otherTo: [2, 3] })).toBeCloseTo(Math.SQRT2)
})

it("distinguishes boundary contact from interior intersections including stationary segments", () => {
  const r = [0, 0, 1, 1] as const
  expect(segmentIntersectsRect({ rect: r, from: [0, 0.5], to: [1, 0.5], boundary: "open" })).toBe(true)
  expect(segmentIntersectsRect({ rect: r, from: [0, 0.5], to: [0, 0.5], boundary: "closed" })).toBe(true)
  expect(segmentIntersectsRect({ rect: r, from: [0, 0.5], to: [0, 0.5], boundary: "open" })).toBe(false)
  expect(segmentIntersectsRect({ rect: r, from: [0.5, 0.5], to: [0.5, 0.5], boundary: "open" })).toBe(true)
  expect(segmentIntersectsRect({ rect: [1, 1, 1, 1], from: [0, 0], to: [2, 2], boundary: "closed" })).toBe(true)
  expect(segmentIntersectsRect({ rect: [1, 1, 1, 1], from: [0, 0], to: [2, 2], boundary: "open" })).toBe(false)
  expect(segmentRectDistance(r, [-1, 2], [2, 2])).toBe(1)
  expect(segmentRectDistance(r, [2, 2], [2, 2])).toBeCloseTo(Math.SQRT2)
})
