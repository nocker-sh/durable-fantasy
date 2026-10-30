import { expect, it } from "vitest"
import { getLimbEnvelope } from "#/lib/graphics/ray/get-limb-envelope"
import type { Vector3Tuple } from "#/lib/engine/vector3-types"
it("includes the widest intermediate joint in both the spherical and axis-aligned envelopes", () => {
  const points: Vector3Tuple[] = [
    [0, 0, 0],
    [1, 4, 0],
    [2, 0, 0],
  ]
  const radii = [0.2, 0.5, 0.3]
  const before = JSON.stringify([points, radii])
  expect(getLimbEnvelope(points, radii)).toEqual({ c: [1, 0, 0], r: 4.51, bounds: { min: [-0.2, -0.3, -0.5], max: [2.3, 4.5, 0.5] } })
  expect(JSON.stringify([points, radii])).toBe(before)
})
it("does not share writable bounds with source joints or another envelope", () => {
  const points: Vector3Tuple[] = [
    [0, 0, 0],
    [1, 0, 0],
  ]
  const first = getLimbEnvelope(points, [0.1, 0.1])
  const second = getLimbEnvelope(points, [0.1, 0.1])
  first.bounds.min[0] = 10
  first.c[0] = 20
  expect(second.bounds.min[0]).toBe(-0.1)
  expect(second.c[0]).toBe(0.5)
  expect(points[0][0]).toBe(0)
})
