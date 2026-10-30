import { limbSd } from "#/lib/graphics/ray/limb-sd"
import { loftSd } from "#/lib/graphics/ray/loft-sd"
import { expect, it } from "vitest"
import { cylinderBounds } from "#/lib/graphics/ray/cylinder-bounds"
it("clips vertical cylinder bounds at the axial end planes", () => {
  expect(cylinderBounds([0, 1, 0], [0, 3, 0], 0.5)).toEqual({ min: [-0.5, 1, -0.5], max: [0.5, 3, 0.5] })
})
it("contains tilted end rings without adding spherical end caps", () => {
  const a: [number, number, number] = [1, 2, 3],
    b: [number, number, number] = [3, 4, 3],
    r = 0.4,
    bounds = cylinderBounds(a, b, r)
  for (const c of [a, b])
    for (let i = 0; i < 128; i++) {
      const t = (i / 128) * Math.PI * 2,
        p = [c[0] + (r * Math.cos(t)) / Math.SQRT2, c[1] - (r * Math.cos(t)) / Math.SQRT2, c[2] + r * Math.sin(t)]
      for (let axis = 0; axis < 3; axis++) {
        expect(p[axis]).toBeGreaterThanOrEqual(bounds.min[axis] - 1e-12)
        expect(p[axis]).toBeLessThanOrEqual(bounds.max[axis] + 1e-12)
      }
    }
  expect(bounds.max[0]).toBeLessThan(b[0] + r)
})

it("bounds the actual signed-distance interiors of tapered limbs and tilted lofts", async () => {
  const shapes = [
    limbSd(
      [
        [0, 0, 0],
        [0.3, 0.4, 0.1],
        [0.1, 0.8, 0.2],
      ],
      [0.2, 0.14, 0.1],
    ),
    loftSd([
      { c: [0, 0, 0], q: [0, 0, 0, 1], w: 0.3, d: 0.15 },
      { c: [0.2, 0.6, 0.1], q: [0, 0, 0, 1], w: 0.2, d: 0.25 },
    ]),
  ]
  for (const shape of shapes) {
    expect(shape.bounds).toBeDefined()
    let inside = 0
    for (let x = -0.5; x <= 0.7; x += 0.04)
      for (let y = -0.3; y <= 1.1; y += 0.04)
        for (let z = -0.5; z <= 0.6; z += 0.04) {
          const p: [number, number, number] = [x, y, z]
          if (shape.sd(p) > 0) continue
          inside++
          if ("boxBounds" in shape) expect(shape.boxBounds()?.some((b) => p.every((v, i) => v >= b.min[i] - 1e-12 && v <= b.max[i] + 1e-12))).toBe(true)
          for (let axis = 0; axis < 3; axis++) {
            expect(p[axis]).toBeGreaterThanOrEqual(shape.bounds!.min[axis] - 1e-12)
            expect(p[axis]).toBeLessThanOrEqual(shape.bounds!.max[axis] + 1e-12)
          }
        }
    expect(inside).toBeGreaterThan(100)
  }
})
