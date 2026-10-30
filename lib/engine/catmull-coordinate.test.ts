import { expect, it } from "vitest"
import { catmullCoordinate } from "#/lib/engine/catmull-coordinate"

it("interpolates the two middle control points and preserves a straight progression", () => {
  const points = { previous: -1, start: 1, end: 3, next: 5 }
  expect(catmullCoordinate({ ...points, time: 0 })).toBe(1)
  expect(catmullCoordinate({ ...points, time: 1 })).toBe(3)
  expect(catmullCoordinate({ ...points, time: 0.25 })).toBe(1.5)
  expect(catmullCoordinate({ ...points, time: -0.5 })).toBe(0)
  expect(catmullCoordinate({ previous: 0, start: 0, end: 2, next: 2, time: 0.5 })).toBe(1)
})
