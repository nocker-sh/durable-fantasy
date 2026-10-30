import { expect, it } from "vitest"
import { getEllipticalFrustumField } from "./get-elliptical-frustum-field"
const props = {
  from: [0, 0, 0] satisfies [number, number, number],
  to: [0, 0, 1] satisfies [number, number, number],
  acrossHint: [1, 0, 0] satisfies [number, number, number],
  radiusFrom: 0.14,
  radiusTo: 0.16,
  compression: 0.4,
  shellThickness: null,
}

it("keeps the hem width while flattening depth and clipping both ends", () => {
  const field = getEllipticalFrustumField(props)
  if (field instanceof Error) throw field
  expect(field.min[1]).toBeCloseTo(-0.064, 12)
  expect(field.max[0]).toBe(0.16)
  expect(field.value([0.1, 0, 0.5])).toBeLessThan(0)
  expect(field.value([0, -0.07, 0.5])).toBeGreaterThan(0)
  expect(field.value([0, 0, 1.1])).toBeGreaterThan(0)
})
it("retains a hollow lining and open annular ends", () => {
  const shell = getEllipticalFrustumField({ ...props, shellThickness: 0.01 })
  if (shell instanceof Error) throw shell
  expect(shell.value([0, 0, 0.5])).toBeGreaterThan(0)
  expect(shell.value([0.145, 0, 0.5])).toBeLessThan(0)
  expect(shell.value([0, 0, 1])).toBeGreaterThan(0)
  expect(shell.value([0.155, 0, 1])).toBeCloseTo(0, 12)
})
it("bounds field changes for rotated tapered solids and shells", () => {
  for (const shellThickness of [null, 0.01]) {
    const field = getEllipticalFrustumField({ ...props, to: [0.2, 0.4, 0.6], radiusFrom: 0.3, radiusTo: 0.05, compression: 0.3, shellThickness })
    if (field instanceof Error) throw field
    for (const x of [-0.2, 0, 0.2])
      for (const y of [-0.1, 0.3, 0.7])
        for (const z of [-0.1, 0.3, 0.7]) {
          const a: [number, number, number] = [x, y, z],
            b: [number, number, number] = [x + 0.0001, y - 0.0002, z + 0.0003]
          expect(Math.abs(field.value(a) - field.value(b))).toBeLessThanOrEqual(field.lipschitz * Math.hypot(0.0001, 0.0002, 0.0003) + 1e-12)
        }
  }
})
it("refuses collapsed axes, invalid compression, overflowing transforms and impossible walls", () => {
  expect(getEllipticalFrustumField({ ...props, to: props.from })).toBeInstanceOf(Error)
  expect(getEllipticalFrustumField({ ...props, acrossHint: [0, 0, 1] })).toBeInstanceOf(Error)
  expect(getEllipticalFrustumField({ ...props, compression: 0 })).toBeInstanceOf(Error)
  expect(getEllipticalFrustumField({ ...props, shellThickness: 0.1 })).toBeInstanceOf(Error)
  expect(getEllipticalFrustumField({ ...props, from: [0, 0, -1e308], to: [0, 0, 1e308] })).toBeInstanceOf(Error)
})
