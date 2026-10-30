import { expect, it } from "vitest"
import { getCirclePolylineClearance } from "./get-circle-polyline-clearance"

it("detects an explicit obstacle between clear endpoints and identifies it without changing the caller's labels", () => {
  const props = {
      points: [
        [0, 0],
        [4, 0],
      ] satisfies ReadonlyArray<readonly [number, number]>,
      radius: 0.4,
      cellSize: 1,
      isCellFree: () => true,
      obstacles: [
        [10, 10, 11, 11],
        [1.9, -0.1, 2.1, 0.1],
      ] satisfies ReadonlyArray<readonly [number, number, number, number]>,
    },
    before = JSON.stringify(props)
  expect(getCirclePolylineClearance(props)).toEqual({ obstacle: 1 })
  expect(JSON.stringify(props)).toBe(before)
})

it("includes supported floor along every segment and the circle around a turning point", () => {
  expect(
    getCirclePolylineClearance({
      points: [
        [0, 0],
        [4, 0],
      ],
      radius: 0.4,
      cellSize: 1,
      isCellFree: (cell) => cell[0] !== 2,
      obstacles: [],
    }),
  ).toBeInstanceOf(Error)
  expect(
    getCirclePolylineClearance({
      points: [
        [0, 0],
        [2, 0],
        [2, 2],
      ],
      radius: 0.4,
      cellSize: 1,
      isCellFree: () => true,
      obstacles: [[2.2, -0.2, 2.3, -0.1]],
    }),
  ).toEqual({ obstacle: 0 })
})

it("permits stationary circles and exact tangency while rejecting positive overlap", () => {
  const props = {
    points: [
      [0, 0],
      [0, 0],
    ] satisfies ReadonlyArray<readonly [number, number]>,
    radius: 0.4,
    cellSize: 1,
    isCellFree: () => true,
    obstacles: [[0.4, -1, 1, 1]] satisfies ReadonlyArray<readonly [number, number, number, number]>,
  }
  expect(getCirclePolylineClearance(props)).toBeNull()
  expect(getCirclePolylineClearance({ ...props, radius: 0.41 })).toEqual({ obstacle: 0 })
})

it("rejects malformed geometry instead of treating it as a missing obstacle or path", () => {
  const props = {
    points: [
      [0, 0],
      [1, 0],
    ] satisfies ReadonlyArray<readonly [number, number]>,
    radius: 0.4,
    cellSize: 1,
    isCellFree: () => true,
    obstacles: [],
  }
  expect(getCirclePolylineClearance({ ...props, points: [[0, 0]] })).toBeInstanceOf(Error)
  expect(getCirclePolylineClearance({ ...props, obstacles: [[NaN, 0, 1, 1]] })).toEqual(new Error("Invalid polyline obstacle"))
  expect(getCirclePolylineClearance({ ...props, radius: Infinity })).toEqual(new Error("Invalid moving footprint"))
})
