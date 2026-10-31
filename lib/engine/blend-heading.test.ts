import { expect, it } from "vitest"
import { blendHeading } from "#/lib/engine/blend-heading"

it("takes the short turn across either side of the angle boundary", () => {
  expect(blendHeading(Math.PI - 0.1, -Math.PI + 0.1, 0.5)).toBeCloseTo(Math.PI)
  expect(blendHeading(-Math.PI + 0.1, Math.PI - 0.1, 0.5)).toBeCloseTo(-Math.PI)
})

it("preserves the signed half-turn and caller's interpolation weight", () => {
  expect(blendHeading(0, Math.PI, 0.5)).toBe(Math.PI / 2)
  expect(blendHeading(0, -Math.PI, 0.5)).toBe(-Math.PI / 2)
  expect(blendHeading(1, 2, 0)).toBe(1)
})

it("keeps accumulated revolutions while choosing the shortest difference", () => {
  expect(blendHeading(Math.PI * 6 + 0.1, 0.3, 1)).toBeCloseTo(Math.PI * 6 + 0.3)
})
