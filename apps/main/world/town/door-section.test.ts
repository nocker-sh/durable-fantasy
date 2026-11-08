import { expect, it } from "vitest"
import { doorLeafSection } from "#/world/town/door-leaf-section"
import { doorMovingThickness } from "#/world/town/door-moving-thickness"
import { doorHandleAlong } from "#/world/town/door-handle-along"
it("keeps the leaf above the finished floor and below the header", () => {
  expect(doorLeafSection(2, { bottom: 0.01, top: 0.005 })).toEqual({ bottom: 0.01, top: 1.995 })
  for (const clearance of [
    { bottom: 0, top: 0.005 },
    { bottom: 0.01, top: -1 },
    { bottom: 1, top: 1 },
    { bottom: NaN, top: 0.005 },
  ])
    expect(() => doorLeafSection(2, clearance)).toThrow("positive clearances")
  expect(() => doorLeafSection(Infinity, { bottom: 0.01, top: 0.005 })).toThrow("positive clearances")
})

it("includes projections on both faces in the moving envelope", () => {
  expect(doorMovingThickness(0.04, { brace_projection_m: 0.006, handle_projection_m: 0.02 })).toBeCloseTo(0.08)
  expect(doorMovingThickness(0.04, { brace_projection_m: 0.03, handle_projection_m: 0.02 })).toBeCloseTo(0.1)
  for (const value of [-1, NaN, Infinity]) expect(() => doorMovingThickness(0.04, { brace_projection_m: 0.006, handle_projection_m: value })).toThrow("projections")
})

it("keeps the measured grip on the leaf instead of substituting its tip", () => {
  expect(doorHandleAlong(0.95, 0.83)).toBe(0.83)
  for (const value of [0, -1, 1, NaN, Infinity]) expect(() => doorHandleAlong(0.95, value)).toThrow("lie on its leaf")
})
