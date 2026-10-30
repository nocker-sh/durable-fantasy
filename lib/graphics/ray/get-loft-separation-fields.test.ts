import { expect, it } from "vitest"
import { loftSd } from "#/lib/graphics/ray/loft-sd"
import { limbSd } from "#/lib/graphics/ray/limb-sd"
import { canSeparateSurfaceFromPrimitive } from "./can-separate-surface-from-primitive"
import { canSeparatePrimitiveFromCuboid } from "./can-separate-primitive-from-cuboid"
import { qfromTo } from "../../engine/qfrom-to"
import type { Ring } from "#/lib/graphics/ray/distance-types"
import type { Primitive } from "./primitive-types"
import type { Vector3Tuple as V3 } from "../../engine/vector3-types"
const distance = (a: V3, b: V3) => Math.hypot(...a.map((value, axis) => value - b[axis]))

it("retains the rendered loft's zero set and finite derivative bounds on tilted tapering segments", () => {
  const rings: Ring[] = [
    { c: [0, 0, 0], q: [0, 0, 0, 1], w: 0.2, d: 0.1 },
    { c: [0.03, 0.25, 0.04], q: qfromTo([0, 1, 0], [0.1, 1, 0.2]), w: 0.08, d: 0.05 },
    { c: [0.02, 0.4, 0.05], q: [0, 0, 0, 1], w: 0.04, d: 0.04 },
  ]
  const loft = loftSd(rings),
    fields = loft.separationFields()
  if (!fields || !loft.bounds) throw new Error("Missing certified loft fields")
  expect(fields).toHaveLength(2)
  for (const field of fields) {
    expect(Number.isFinite(field.lipschitz) && field.lipschitz > 0).toBe(true)
    const points: V3[] = Array.from({ length: 27 }, (_, index) => [
      field.min[0] + (field.max[0] - field.min[0]) * ((index % 3) / 2),
      field.min[1] + (field.max[1] - field.min[1]) * ((Math.floor(index / 3) % 3) / 2),
      field.min[2] + (field.max[2] - field.min[2]) * (Math.floor(index / 9) / 2),
    ])
    for (const a of points) for (const b of points) expect(Math.abs(field.value(a) - field.value(b))).toBeLessThanOrEqual(field.lipschitz * distance(a, b) + 1e-12)
  }
  for (const x of [-0.12, 0, 0.12])
    for (const y of [0.02, 0.1, 0.2, 0.3, 0.38])
      for (const z of [-0.04, 0, 0.04, 0.08]) {
        const point: V3 = [x, y, z],
          inside = fields.some((field) => point.every((value, axis) => value >= field.min[axis] && value <= field.max[axis]) && field.value(point) <= 0)
        expect(inside).toBe(loft.sd(point) <= 0)
      }
})

it("refines a clear ellipse corner while preserving rejection of actual penetration", () => {
  const loft = loftSd([
    { c: [0, 0, 0], q: [0, 0, 0, 1], w: 0.2, d: 0.1 },
    { c: [0, 0.4, 0], q: [0, 0, 0, 1], w: 0.2, d: 0.1 },
  ])
  const primitive: Primitive = {
    kind: "sdf",
    a: loft.c,
    b: loft.c,
    r: loft.r,
    r2: 0,
    bounds: loft.bounds,
    boxBounds: loft.boxBounds,
    separationFields: loft.separationFields,
    sd: loft.sd,
    m: () => ["skin", 0],
    id: 0,
  }
  const clear = limbSd(
      [
        [0.19, 0.19, 0.09],
        [0.19, 0.21, 0.09],
      ],
      [0.005, 0.005],
    ),
    inside = limbSd(
      [
        [0, 0.19, 0],
        [0, 0.21, 0],
      ],
      [0.005, 0.005],
    )
  expect(canSeparateSurfaceFromPrimitive({ surface: clear, primitive: { ...primitive, separationFields: undefined }, margin: 0 })).toBe(false)
  expect(canSeparateSurfaceFromPrimitive({ surface: clear, primitive, margin: 0 })).toBe(true)
  expect(canSeparateSurfaceFromPrimitive({ surface: inside, primitive, margin: 0 })).toBe(false)
  expect(canSeparatePrimitiveFromCuboid({ primitive, box: { x0: 0.186, x1: 0.194, bottom: 0.19, top: 0.21, z0: 0.086, z1: 0.094 } })).toBe(true)
  expect(canSeparatePrimitiveFromCuboid({ primitive, box: { x0: -0.01, x1: 0.01, bottom: 0.19, top: 0.21, z0: -0.01, z1: 0.01 } })).toBe(false)
})

it("does not expose a partial or invented certificate for degenerate profiles", () => {
  const ring: Ring = { c: [0, 0, 0], q: [0, 0, 0, 1], w: 0.2, d: 0.1 }
  expect(loftSd([ring, ring]).separationFields()).toBeUndefined()
  expect(loftSd([ring, { ...ring, c: [0, 0.2, 0], w: 0 }]).separationFields()).toBeUndefined()
})

it("snapshots author inputs so rendered surfaces and their certificates cannot diverge after mutation", () => {
  const rings: Ring[] = [
    { c: [0, 0, 0], q: [0, 0, 0, 1], w: 0.2, d: 0.1 },
    { c: [0, 0.3, 0], q: [0, 0, 0, 1], w: 0.05, d: 0.04 },
  ]
  const loft = loftSd(rings),
    fields = loft.separationFields(),
    point: V3 = [0.04, 0.1, 0.02],
    before = loft.sd(point),
    values = fields?.map((field) => field.value(point))
  rings[0].c[0] = 10
  rings[0].q[0] = 0.5
  rings[1].w = 2
  expect(loft.sd(point)).toBe(before)
  expect(fields?.map((field) => field.value(point))).toEqual(values)
})
