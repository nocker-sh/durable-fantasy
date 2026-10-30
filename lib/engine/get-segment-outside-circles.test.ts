import { expect, it } from "vitest"
import { getSegmentOutsideCircles } from "#/lib/engine/get-segment-outside-circles"

it("clips partial overlaps missed by a midpoint test, keeping both surviving sides", () => {
  const props = { from: [0, 0] satisfies readonly [number, number], to: [4, 0] satisfies readonly [number, number], centres: [[1, 0]] satisfies ReadonlyArray<readonly [number, number]>, radius: 0.5 }
  const before = JSON.stringify(props)
  expect(getSegmentOutsideCircles(props)).toEqual([
    [0, 0.125],
    [0.375, 1],
  ])
  expect(JSON.stringify(props)).toBe(before)
})

it("unions touching and overlapping openings without duplicate slivers and handles complete removal", () => {
  expect(
    getSegmentOutsideCircles({
      from: [0, 0],
      to: [4, 0],
      centres: [
        [1, 0],
        [2, 0],
        [2, 0],
      ],
      radius: 1,
    }),
  ).toEqual([[0.75, 1]])
  expect(getSegmentOutsideCircles({ from: [0, 0], to: [1, 0], centres: [[0.5, 0]], radius: 1 })).toEqual([])
})

it("uses perpendicular distance for diagonal lines and leaves tangency or remote circles intact", () => {
  const sections = getSegmentOutsideCircles({ from: [0, 0], to: [4, 4], centres: [[2, 2]], radius: Math.sqrt(2) })
  expect(sections).toEqual([
    [0, 0.25],
    [0.75, 1],
  ])
  expect(
    getSegmentOutsideCircles({
      from: [0, 0],
      to: [4, 0],
      centres: [
        [2, 1],
        [20, 0],
      ],
      radius: 1,
    }),
  ).toEqual([[0, 1]])
})

it("rejects degenerate and unbounded inputs instead of drawing an uncut rail", () => {
  for (const to of [
    [0, 0],
    [Infinity, 0],
    [Number.MAX_VALUE, 0],
  ])
    expect(getSegmentOutsideCircles({ from: [0, 0], to: [to[0], to[1]], centres: [], radius: 0.6 })).toBeInstanceOf(Error)
  expect(getSegmentOutsideCircles({ from: [0, 0], to: [1, 0], centres: [[NaN, 0]], radius: 0.6 })).toBeInstanceOf(Error)
})
