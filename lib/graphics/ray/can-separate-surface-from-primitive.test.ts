import { expect, it, vi } from "vitest"
import { canSeparateSurfaceFromPrimitive } from "#/lib/graphics/ray/can-separate-surface-from-primitive"
import { getConeSeparationField } from "#/lib/graphics/ray/get-cone-separation-field"
import { limbSd } from "#/lib/graphics/ray/limb-sd"
import type { Primitive } from "#/lib/graphics/ray/primitive-types"
const cone: Primitive = { kind: "cone", a: [0, 0, 0], b: [0, 1, 0], r: 0.5, r2: 0.05, id: 0, m: () => ["test", 0] }

it("refines overlapping capsule envelopes using the actual tapered cone field", () => {
  const surface = limbSd(
    [
      [0.3, 0.85, 0],
      [0.3, 0.9, 0],
    ],
    [0.02, 0.02],
  )
  expect(canSeparateSurfaceFromPrimitive({ surface, primitive: cone, margin: 0 })).toBe(true)
  expect(canSeparateSurfaceFromPrimitive({ surface, primitive: cone, margin: 0.25 })).toBe(false)
})
it("rejects a real intersection inside the tapered surface", () => {
  const surface = limbSd(
    [
      [0.08, 0.8, 0],
      [0.08, 0.9, 0],
    ],
    [0.02, 0.02],
  )
  expect(surface.sd([0.08, 0.85, 0])).toBeLessThan(0)
  expect(getConeSeparationField(cone)?.value([0.08, 0.85, 0])).toBeLessThan(0)
  expect(canSeparateSurfaceFromPrimitive({ surface, primitive: cone, margin: 0 })).toBe(false)
})
it("refuses invalid margins and degenerate cones instead of assuming a signed field exists", () => {
  const surface = limbSd(
    [
      [0.08, 0, 0],
      [0.08, 0.01, 0],
    ],
    [0.02, 0.02],
  )
  expect(getConeSeparationField({ ...cone, b: cone.a })).toBeNull()
  for (const margin of [-1, NaN, Infinity]) expect(canSeparateSurfaceFromPrimitive({ surface, primitive: cone, margin })).toBe(false)
})

it("uses an SDF's enclosing sphere without mistaking the corners of its box for occupied space", () => {
  const primitive: Primitive = { kind: "sdf", a: [0, 0, 0], b: [0, 0, 0], r: 1, r2: 0, id: 1, sd: (point) => Math.hypot(...point) - 1, m: () => ["test", 0] }
  const surface = limbSd(
    [
      [0.9, 0.9, 0],
      [0.95, 0.9, 0],
    ],
    [0.02, 0.02],
  )
  expect(canSeparateSurfaceFromPrimitive({ surface, primitive, margin: 0 })).toBe(true)
  expect(canSeparateSurfaceFromPrimitive({ surface, primitive, margin: 0.3 })).toBe(false)
})
it("does not treat empty auxiliary enclosures or sphere scales on an SDF as a clearance proof", () => {
  const surface = limbSd(
    [
      [0.6, 0.6, 0],
      [0.65, 0.6, 0],
    ],
    [0.02, 0.02],
  )
  const primitive: Primitive = {
    kind: "sdf",
    a: [0, 0, 0],
    b: [0, 0, 0],
    r: 1,
    r2: 0,
    id: 1,
    sx: 0.1,
    sy: 0.1,
    sz: 0.1,
    sd: (point) => Math.hypot(...point) - 1,
    capsuleBounds: () => [],
    boxBounds: () => [],
    m: () => ["test", 0],
  }
  expect(canSeparateSurfaceFromPrimitive({ surface, primitive, margin: 0 })).toBe(false)
})

it("refines a tapered moving surface even when its maximum-radius capsule overlaps a fixed sphere", () => {
  const surface = limbSd(
    [
      [1.23, -0.5, 0],
      [1.23, 0.3, 0],
    ],
    [0.3, 0.01],
  )
  const primitive: Primitive = { kind: "sdf", a: [0, 0, 0], b: [0, 0, 0], r: 1, r2: 0, id: 1, sd: (point) => Math.hypot(...point) - 1, m: () => ["test", 0] }
  expect(surface.sd([0, 0, 0])).toBeGreaterThan(1)
  expect(canSeparateSurfaceFromPrimitive({ surface, primitive, margin: 0 })).toBe(true)
  expect(canSeparateSurfaceFromPrimitive({ surface, primitive, margin: 0.05 })).toBe(false)
})

it("proves a distant bounded surface without rebuilding its capsule enclosures", () => {
  const surface = limbSd(
    [
      [10, 10, 10],
      [11, 10, 10],
    ],
    [0.1, 0.1],
  )
  const capsules = vi.fn(surface.capsuleBounds)
  expect(canSeparateSurfaceFromPrimitive({ surface: { ...surface, capsuleBounds: capsules }, primitive: cone, margin: 0.5 })).toBe(true)
  expect(capsules).not.toHaveBeenCalled()
})

it("does not let detailed enclosures certify malformed outer bounds", () => {
  const surface = limbSd(
    [
      [10, 10, 10],
      [11, 10, 10],
    ],
    [0.1, 0.1],
  )
  for (const axis of [0, 1, 2]) {
    const bounds: NonNullable<Primitive["bounds"]> = { min: [-1, -1, -1], max: [1, 1, 1] }
    bounds.min[axis] = NaN
    expect(canSeparateSurfaceFromPrimitive({ surface, primitive: { ...cone, bounds }, margin: 0 })).toBe(false)
    expect(canSeparateSurfaceFromPrimitive({ surface: { ...surface, bounds }, primitive: cone, margin: 0 })).toBe(false)
    bounds.min[axis] = 2
    expect(canSeparateSurfaceFromPrimitive({ surface, primitive: { ...cone, bounds }, margin: 0 })).toBe(false)
    expect(canSeparateSurfaceFromPrimitive({ surface: { ...surface, bounds }, primitive: cone, margin: 0 })).toBe(false)
  }
})
