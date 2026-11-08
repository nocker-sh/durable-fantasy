import { expect, it } from "vitest"
import { canRestGarmentOnSeat } from "#/world/scene/can-rest-garment-on-seat"
import { getSupportedThighField } from "#/world/scene/figure/get-supported-thigh-field"
import { createSolidSurfaceMaterial } from "#/lib/graphics/ray/create-solid-surface-material"
import type { Primitive } from "#/lib/graphics/ray/primitive-types"
const field = getSupportedThighField({
  points: [
    [0, 0.44, 0],
    [0.05, 0.426, 0.3],
    [0.05, 0.1, 0.3],
  ],
  radii: [0.06, 0.055, 0.054],
  supportY: 0.376,
})
if (field instanceof Error) throw field
const primitive: Primitive = { kind: "sdf", id: 0, a: field.c, b: field.c, r: field.r, r2: 0, sd: field.sd, boxBounds: field.boxBounds, m: createSolidSurfaceMaterial("cLinen") }
const seat = { x0: -0.2, x1: 0.2, bottom: 0.336, top: 0.376, z0: -0.3, z1: 0.12 }
it("allows exact thigh contact but refuses a raised board or a board extended through the shin", () => {
  expect(canRestGarmentOnSeat(primitive, seat)).toBe(true)
  expect(canRestGarmentOnSeat(primitive, { ...seat, top: 0.377 })).toBe(false)
  expect(canRestGarmentOnSeat(primitive, { ...seat, z1: 0.35 })).toBe(false)
})
it("fails closed without conservative geometry or with invalid bounds", () => {
  expect(canRestGarmentOnSeat({ ...primitive, boxBounds: undefined }, seat)).toBe(false)
  expect(canRestGarmentOnSeat({ ...primitive, boxBounds: () => [] }, seat)).toBe(false)
  expect(canRestGarmentOnSeat(primitive, { ...seat, top: NaN })).toBe(false)
  expect(canRestGarmentOnSeat({ ...primitive, boxBounds: () => [{ min: [0, 0, NaN], max: [1, 1, 1] }] }, seat)).toBe(false)
})
