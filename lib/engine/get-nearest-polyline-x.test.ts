import { expect, it } from "vitest"
import { getNearestPolylineX } from "#/lib/engine/get-nearest-polyline-x"
import type { Vector2Tuple } from "#/lib/engine/vector2-types"

it("selects the first closest sample without interpolating", () => {
  const points: Vector2Tuple[] = [
    [8, 2],
    [20, 8],
    [30, 12],
  ]
  const snapshot = structuredClone(points)
  expect(getNearestPolylineX(10, points)).toBe(20)
  expect(getNearestPolylineX(12, points)).toBe(30)
  expect(getNearestPolylineX(5, points)).toBe(8)
  expect(points).toEqual(snapshot)
})

it("preserves the zero fallback for empty or out-of-range samples", () => {
  expect(getNearestPolylineX(0, [])).toBe(0)
  expect(getNearestPolylineX(0, [[2, 1e9]])).toBe(0)
  expect(getNearestPolylineX(0, [[2, 1e9 - 1]])).toBe(2)
  expect(getNearestPolylineX(NaN, [[2, 3]])).toBe(0)
})
