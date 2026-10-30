import { expect, it } from "vitest"
import { getCatmullPath } from "#/lib/engine/get-catmull-path"
import type { Vector2Tuple } from "#/lib/engine/vector2-types"

it("returns an empty curve or the single original endpoint", () => {
  expect(getCatmullPath([])).toEqual([])
  const point: Vector2Tuple = [2, 3]
  expect(getCatmullPath([point])).toEqual([point])
  expect(getCatmullPath([point])[0]).toBe(point)
})

it("keeps the exact segment sampling order and final endpoint without changing controls", () => {
  const points: Vector2Tuple[] = [
    [0, 0],
    [4, 0],
  ]
  const snapshot = structuredClone(points)
  expect(getCatmullPath(points, 4)).toEqual([
    [0, 0],
    [0.8125, 0],
    [2, 0],
    [3.1875, 0],
    [4, 0],
  ])
  expect(getCatmullPath(points, 1)).toEqual(points)
  expect(getCatmullPath(points).at(-1)).toBe(points[1])
  expect(points).toEqual(snapshot)
})

it("preserves repeated control points and their sample count", () => {
  expect(
    getCatmullPath(
      [
        [2, 3],
        [2, 3],
        [2, 3],
      ],
      2,
    ),
  ).toEqual(Array.from({ length: 5 }, () => [2, 3]))
})

it.each([0, -1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])("rejects invalid sampling %s", (samples) => {
  expect(() =>
    getCatmullPath(
      [
        [0, 0],
        [1, 1],
      ],
      samples,
    ),
  ).toThrow(RangeError)
})
