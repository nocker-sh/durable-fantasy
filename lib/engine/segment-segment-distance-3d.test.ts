import { expect, it } from "vitest"
import { segmentSegmentDistance3D as distance } from "#/lib/engine/segment-segment-distance-3d"
it("finds interior crossings and skew closest points, not just endpoints", () => {
  expect(distance({ firstStart: [-1, 0, 0], firstEnd: [1, 0, 0], secondStart: [0, -1, 0], secondEnd: [0, 1, 0] })).toBe(0)
  expect(distance({ firstStart: [-1, 0, 0], firstEnd: [1, 0, 0], secondStart: [0, -1, 0.2], secondEnd: [0, 1, 0.2] })).toBeCloseTo(0.2, 12)
})
it("handles points, parallel overlaps and separated endpoints symmetrically", () => {
  const cases = [
    [[0, 0, 0], [0, 0, 0], [1, 2, 2], [1, 2, 2], 3],
    [[0, 0, 0], [2, 0, 0], [1, 1, 0], [3, 1, 0], 1],
    [[0, 0, 0], [1, 0, 0], [2, 1, 0], [3, 1, 0], Math.SQRT2],
    [[0, 0, 0], [2, 0, 0], [1, 0, 0], [3, 0, 0], 0],
    [[1, 1, 0], [1, 1, 0], [0, 0, 0], [2, 0, 0], 1],
  ] as const
  for (const [a, b, c, d, expected] of cases)
    for (const [p, q, r, s] of [
      [a, b, c, d],
      [c, d, a, b],
      [b, a, d, c],
    ])
      expect(distance({ firstStart: p, firstEnd: q, secondStart: r, secondEnd: s })).toBeCloseTo(expected, 12)
})

it("retains interior intersections for almost parallel directions", () => {
  expect(distance({ firstStart: [0, 0, 0], firstEnd: [1, 0, 0], secondStart: [0, -1e-10, 0], secondEnd: [1, 1e-10, 0] })).toBeCloseTo(0, 14)
  expect(distance({ firstStart: [0, 0, 0], firstEnd: [1, 0, 0], secondStart: [0, -1e-10, 0.01], secondEnd: [1, 1e-10, 0.01] })).toBeCloseTo(0.01, 14)
})
