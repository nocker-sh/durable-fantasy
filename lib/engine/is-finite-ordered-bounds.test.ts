import { expect, it } from "vitest"
import { isFiniteOrderedBounds } from "./is-finite-ordered-bounds"

it("accepts closed degenerate bounds and rejects every nonfinite or reversed coordinate", () => {
  expect(isFiniteOrderedBounds({ min: [-0, 0, 0], max: [0, 0, 0] })).toBe(true)
  for (const axis of [0, 1, 2]) {
    const minimum: [number, number, number] = [-1, -1, -1]
    const maximum: [number, number, number] = [1, 1, 1]
    for (const point of [minimum, maximum]) {
      for (const invalid of [NaN, Infinity, -Infinity]) {
        const original = point[axis]
        point[axis] = invalid
        expect(isFiniteOrderedBounds({ min: minimum, max: maximum })).toBe(false)
        point[axis] = original
      }
    }
    minimum[axis] = 2
    expect(isFiniteOrderedBounds({ min: minimum, max: maximum })).toBe(false)
  }
})
it("retains validation of coordinates appended through a mutable tuple's owner", () => {
  const minimum: [number, number, number] = [0, 0, 0]
  const maximum: [number, number, number] = [1, 1, 1]
  minimum.push(NaN)
  expect(isFiniteOrderedBounds({ min: minimum, max: maximum })).toBe(false)
  minimum.pop()
  maximum.push(Infinity)
  expect(isFiniteOrderedBounds({ min: minimum, max: maximum })).toBe(false)
  maximum.pop()
  maximum.push(2)
  expect(isFiniteOrderedBounds({ min: minimum, max: maximum })).toBe(true)
})
