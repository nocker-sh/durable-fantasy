import { expect, it } from "vitest"
import { canCoverRectangleWithPath } from "#/lib/engine/can-cover-rectangle-with-path"

it("accepts a full-width rectangle on a narrow straight road without requiring an enclosing circle", () => {
  expect(
    canCoverRectangleWithPath({
      bounds: [1, 1.55, 4, 2.45],
      points: [
        [0, 2],
        [5, 2],
      ],
      radius: 0.5,
    }),
  ).toBe(true)
})

it("covers a bend using both segments rather than requiring one capsule to cover everything", () => {
  expect(
    canCoverRectangleWithPath({
      bounds: [1.4, 1.5, 2.5, 2.6],
      points: [
        [0, 2],
        [2, 2],
        [2, 5],
      ],
      radius: 0.75,
    }),
  ).toBe(true)
})

it("does not fill the hole inside a U-shaped path even when all rectangle corners are covered", () => {
  expect(
    canCoverRectangleWithPath({
      bounds: [0, 0, 4, 4],
      points: [
        [0, 0],
        [0, 4],
        [4, 4],
        [4, 0],
      ],
      radius: 0.5,
    }),
  ).toBe(false)
})
