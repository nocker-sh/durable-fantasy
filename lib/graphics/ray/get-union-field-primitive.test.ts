import { expect, it } from "vitest"
import { getUnionFieldPrimitive } from "#/lib/graphics/ray/get-union-field-primitive"
import type { BoundedField } from "#/lib/engine/field-separation"
const left: BoundedField = { min: [-1, -0.2, -0.2], max: [-0.5, 0.2, 0.2], lipschitz: 1, value: () => 0 }
const right: BoundedField = { min: [0.5, -0.2, -0.2], max: [1, 0.2, 0.2], lipschitz: 1, value: () => 0 }
it("keeps bounded component domains instead of filling their gap", () => {
  const shape = getUnionFieldPrimitive([left, right])
  if (shape instanceof Error) throw shape
  expect(shape.sd([-0.75, 0, 0])).toBe(0)
  expect(shape.sd([0.75, 0, 0])).toBe(0)
  expect(shape.sd([0, 0, 0])).toBeGreaterThan(0)
  expect(shape.sd([0.75, 1, 0])).toBeGreaterThan(0)
  expect(shape.bounds).toEqual({ min: [-1, -0.2, -0.2], max: [1, 0.2, 0.2] })
})
it("refuses missing or uncertified component domains", () => {
  expect(getUnionFieldPrimitive([])).toBeInstanceOf(Error)
  expect(getUnionFieldPrimitive([{ ...left, lipschitz: NaN }])).toBeInstanceOf(Error)
  expect(getUnionFieldPrimitive([{ ...left, min: [0, 0, 0], max: [-1, 1, 1] }])).toBeInstanceOf(Error)
})
