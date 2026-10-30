import { expect, it } from "vitest"
import { canSeparateFieldsFromPrimitive } from "#/lib/graphics/ray/can-separate-fields-from-primitive"
import { createSolidSurfaceMaterial } from "#/lib/graphics/ray/create-solid-surface-material"
import type { Primitive } from "#/lib/graphics/ray/primitive-types"
import type { BoundedField } from "#/lib/engine/field-separation"
const filled: BoundedField = { min: [0, 0, 0], max: [1, 1, 1], value: () => -1, lipschitz: 1 }
const sphere: Primitive = { id: 0, kind: "sph", a: [2, 0.5, 0.5], b: [2, 0.5, 0.5], r: 0.2, r2: 0, m: createSolidSurfaceMaterial("wood") }

it("requires separation of every filled component for spheres, cones and native signed fields", () => {
  expect(canSeparateFieldsFromPrimitive({ fields: [filled], primitive: sphere })).toBe(true)
  expect(canSeparateFieldsFromPrimitive({ fields: [filled], primitive: { ...sphere, a: [0.5, 0.5, 0.5] } })).toBe(false)
  expect(canSeparateFieldsFromPrimitive({ fields: [filled], primitive: { ...sphere, kind: "cone", a: [0.5, -0.5, 0.5], b: [0.5, 1.5, 0.5], r2: 0.1 } })).toBe(false)
  const native: Primitive = { ...sphere, kind: "sdf", a: [0.5, 0.5, 0.5], r: 0.2, sdLipschitz: 1, sd: (point) => Math.hypot(point[0] - 0.5, point[1] - 0.5, point[2] - 0.5) - 0.2 }
  expect(canSeparateFieldsFromPrimitive({ fields: [filled], primitive: native })).toBe(false)
  expect(canSeparateFieldsFromPrimitive({ fields: [filled, { ...filled, min: [1.9, 0, 0], max: [2.1, 1, 1] }], primitive: sphere })).toBe(false)
})
it("never accepts an absent envelope or an unresolved field", () => {
  expect(canSeparateFieldsFromPrimitive({ fields: [], primitive: sphere })).toBe(false)
  expect(canSeparateFieldsFromPrimitive({ fields: [{ ...filled, value: () => NaN }], primitive: { ...sphere, a: [0.5, 0.5, 0.5] } })).toBe(false)
})
