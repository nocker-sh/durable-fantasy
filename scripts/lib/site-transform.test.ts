import { expect, it } from "vitest"
import { siteTransform } from "#/scripts/lib/site-transform"
it.each([
  { quarters: 0, point: [2, 1], direction: [1, 2], size: [6, 4] },
  { quarters: 1, point: [1, 4], direction: [2, -1], size: [4, 6] },
  { quarters: 2, point: [4, 3], direction: [-1, -2], size: [6, 4] },
  { quarters: 3, point: [3, 2], direction: [-2, 1], size: [4, 6] },
])("keeps the footprint, doorway point and outward direction aligned at turn $quarters", ({ quarters, point, direction, size }) => {
  const transform = siteTransform(6, 4, quarters)
  expect(transform.point(2, 1)).toEqual(point)
  expect(transform.direction(1, 2)).toEqual(direction)
  expect(transform.size).toEqual(size)
  const corners = [
    [0, 0],
    [6, 0],
    [0, 4],
    [6, 4],
  ].map(([x, z]) => transform.point(x, z))
  expect([Math.min(...corners.map(([x]) => x)), Math.min(...corners.map(([, z]) => z))]).toEqual([0, 0])
  expect([Math.max(...corners.map(([x]) => x)), Math.max(...corners.map(([, z]) => z))]).toEqual(size)
})

it.each([0, 1, 2, 3])("returns canonical cardinal directions after turn %s without leaking negative zero", (quarters) => {
  const transform = siteTransform(6, 4, quarters)
  for (const [x, z] of [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ]) {
    const result = transform.direction(x, z)
    expect(Math.abs(result[0]) + Math.abs(result[1])).toBe(1)
    expect(result.some((value) => Object.is(value, -0))).toBe(false)
  }
})
