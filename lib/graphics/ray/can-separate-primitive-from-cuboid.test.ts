import { expect, it } from "vitest"
import { canSeparatePrimitiveFromCuboid } from "./can-separate-primitive-from-cuboid"
import type { Primitive } from "./primitive-types"
const primitive: Primitive = { kind: "cone", a: [0, 0, 0], b: [0, 1, 0], r: 0.5, r2: 0.05, id: 0, m: () => ["test", 0] }

it("refines the cone's broad envelope without accepting an occupied box", () => {
  const box = { x0: 0.29, x1: 0.31, bottom: 0.84, top: 0.86, z0: -0.01, z1: 0.01 }
  expect(canSeparatePrimitiveFromCuboid({ primitive, box })).toBe(true)
  expect(canSeparatePrimitiveFromCuboid({ primitive, box: { ...box, x0: 0.07, x1: 0.09 } })).toBe(false)
})
it("does not certify empty auxiliary bounds or malformed obstacles", () => {
  const sphere: Primitive = { ...primitive, kind: "sdf", a: [0, 0, 0], b: [0, 0, 0], r: 1, capsuleBounds: () => [], boxBounds: () => [], sd: (point) => Math.hypot(...point) - 1 }
  const box = { x0: -0.1, x1: 0.1, bottom: -0.1, top: 0.1, z0: -0.1, z1: 0.1 }
  expect(canSeparatePrimitiveFromCuboid({ primitive: sphere, box })).toBe(false)
  expect(canSeparatePrimitiveFromCuboid({ primitive: sphere, box: { ...box, top: NaN } })).toBe(false)
  expect(canSeparatePrimitiveFromCuboid({ primitive: sphere, box: { ...box, x1: box.x0 } })).toBe(false)
})

it("refuses malformed primitive bounds even when another axis appears separated", () => {
  const box = { x0: 4, x1: 5, bottom: 4, top: 5, z0: 4, z1: 5 }
  for (const axis of [0, 1, 2]) {
    for (const side of ["min", "max"] as const) {
      for (const invalid of [NaN, Infinity, -Infinity]) {
        const bounds: NonNullable<Primitive["bounds"]> = { min: [-1, -1, -1], max: [1, 1, 1] }
        bounds[side][axis] = invalid
        expect(canSeparatePrimitiveFromCuboid({ primitive: { ...primitive, bounds }, box })).toBe(false)
      }
    }
    const bounds: NonNullable<Primitive["bounds"]> = { min: [-1, -1, -1], max: [1, 1, 1] }
    bounds.min[axis] = 2
    expect(canSeparatePrimitiveFromCuboid({ primitive: { ...primitive, bounds }, box })).toBe(false)
  }
})
