import { expect, it } from "vitest"
import { getSupportedThighField } from "#/world/scene/figure/get-supported-thigh-field"
import { limbSd } from "#/lib/graphics/ray/limb-sd"
import type { Vector3Tuple as V3 } from "../../../lib/engine/vector3-types"

const points: V3[] = [
  [0, 0.44, 0],
  [0.05, 0.426, 0.3],
  [0.05, 0.1, 0.3],
]
const radii = [0.06, 0.055, 0.054]
it("flattens only the supporting thigh and keeps the shin below the support plane", () => {
  const original = limbSd(points, radii),
    field = getSupportedThighField({ points, radii, supportY: 0.376 })
  if (field instanceof Error) throw field
  const intrusion: V3 = [0.033, 0.3755, 0.2],
    shin: V3 = [0.05, 0.2, 0.3]
  expect(original.sd(intrusion)).toBeLessThan(0)
  expect(field.sd(intrusion)).toBeGreaterThan(0)
  expect(field.sd([0.033, 0.376, 0.2])).toBe(0)
  expect(field.sd(shin)).toBe(original.sd(shin))
  expect(field.bounds).toEqual(original.bounds)
  expect(field.capsuleBounds()).toEqual(original.capsuleBounds())
})
it("rejects incomplete and invalid profiles", () => {
  expect(getSupportedThighField({ points: points.slice(1), radii, supportY: 0.376 })).toBeInstanceOf(Error)
  expect(getSupportedThighField({ points, radii: [0.06, 0, 0.054], supportY: 0.376 })).toBeInstanceOf(Error)
  expect(getSupportedThighField({ points: [points[0], points[0], points[2]], radii, supportY: 0.376 })).toBeInstanceOf(Error)
  expect(getSupportedThighField({ points, radii, supportY: 1 })).toBeInstanceOf(Error)
  expect(getSupportedThighField({ points, radii, supportY: NaN })).toBeInstanceOf(Error)
})
