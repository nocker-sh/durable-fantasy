import { expect, it } from "vitest"
import { solidLeafHitsBox } from "./solid-door"
it("detects thickness on the opposite side of the closed centreline", () => {
  expect(solidLeafHitsBox(1, 0.04, [0.5, -0.015, 0.6, -0.01])).toBe(true)
})
it("does not invent a circular cap behind both sides of the hinge", () => {
  expect(solidLeafHitsBox(1, 0.04, [-0.02, -0.02, -0.01, -0.01])).toBe(false)
})
it("detects a collision strictly between the fully open and closed positions", () => {
  const angle = (17 * Math.PI) / 180,
    x = 0.8 * Math.cos(angle),
    y = 0.8 * Math.sin(angle)
  expect(solidLeafHitsBox(1, 0.04, [x, y, x + 0.002, y + 0.002])).toBe(true)
})
it("does not confuse the unused corner of the sweep's bounding box with the leaf", () => {
  expect(solidLeafHitsBox(1, 0.04, [0.8, 0.8, 0.9, 0.9])).toBe(false)
})
it("distinguishes positive overlap from touching the leaf's edge", () => {
  expect(solidLeafHitsBox(1, 0.04, [0.5, -0.04, 0.6, -0.02])).toBe(false)
  expect(solidLeafHitsBox(1, 0.04, [0.5, -0.04, 0.6, -0.019])).toBe(true)
})
