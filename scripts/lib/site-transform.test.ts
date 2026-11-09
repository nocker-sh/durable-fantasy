import { expect, it } from "vitest"
import { siteTransform } from "#/scripts/lib/site-transform"
it.each([
  { quarters: 0, point: [2, 1], direction: [1, 2], size: [6, 4] },
  { quarters: 1, point: [1, 4], direction: [2, -1], size: [4, 6] },
  { quarters: 2, point: [4, 3], direction: [-1, -2], size: [6, 4] },
  { quarters: 3, point: [3, 2], direction: [-2, 1], size: [4, 6] },
])("keeps the footprint, doorway point and outward direction aligned at turn $quarters", (props1) => {
  const quarters = props1.quarters,
    point = props1.point,
    direction = props1.direction,
    size = props1.size

  const transform = siteTransform(6, 4, quarters)
  expect(transform.point(2, 1)).toEqual(point)
  expect(transform.direction(1, 2)).toEqual(direction)
  expect(transform.size).toEqual(size)
  const corners = [
    [0, 0],
    [6, 0],
    [0, 4],
    [6, 4],
  ].map((entry2) => {
    const x = entry2[0],
      z = entry2[1]
    return transform.point(x, z)
  })
  expect([
    Math.min(
      ...corners.map((entry3) => {
        const x = entry3[0]
        return x
      }),
    ),
    Math.min(
      ...corners.map((entry4) => {
        const z = entry4[1]
        return z
      }),
    ),
  ]).toEqual([0, 0])
  expect([
    Math.max(
      ...corners.map((entry5) => {
        const x = entry5[0]
        return x
      }),
    ),
    Math.max(
      ...corners.map((entry6) => {
        const z = entry6[1]
        return z
      }),
    ),
  ]).toEqual(size)
})

it.each([0, 1, 2, 3])("returns canonical cardinal directions after turn %s without leaking negative zero", (quarters) => {
  const transform = siteTransform(6, 4, quarters)
  for (const entry7 of [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ]) {
    const x = entry7[0],
      z = entry7[1]

    const result = transform.direction(x, z)
    expect(Math.abs(result[0]) + Math.abs(result[1])).toBe(1)
    expect(result.some((value) => Object.is(value, -0))).toBe(false)
  }
})
