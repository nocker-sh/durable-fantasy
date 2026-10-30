import { expect, it } from "vitest"
import { getCapsuleSurfaceNormal } from "./get-capsule-surface-normal"
import { getSphereSurfaceNormal } from "./get-sphere-surface-normal"
import type { Primitive } from "./primitive-types"
const capsule: Primitive = { kind: "cap", a: [1, 2, 3], b: [1, 2, 3], r: 0.5, r2: 0.5, id: 0, m: () => ["test", 0] }

it("uses the sphere normal when the capsule axis has zero length", () => {
  for (const point of [
    [1.5, 2, 3],
    [1, 2.5, 3],
    [1, 2, 2.5],
  ] satisfies [number, number, number][]) {
    const normal = getCapsuleSurfaceNormal(point, capsule)
    expect(normal).toEqual(getSphereSurfaceNormal(point, { a: capsule.a }))
    expect(normal.every(Number.isFinite)).toBe(true)
  }
})

it("retains side and rounded-end normals and keeps a singular centre direction at zero", () => {
  const primitive = { ...capsule, a: [0, 0, 0], b: [0, 1, 0] } satisfies Primitive
  expect(getCapsuleSurfaceNormal([0.5, 0.5, 0], primitive)).toEqual([1, 0, 0])
  expect(getCapsuleSurfaceNormal([0, 1.5, 0], primitive)).toEqual([0, 1, 0])
  expect(getCapsuleSurfaceNormal([0, -0.5, 0], primitive)).toEqual([0, -1, 0])
  expect(getCapsuleSurfaceNormal(capsule.a, capsule)).toEqual([0, 0, 0])
})

it("reads frozen geometric endpoints and returns a normal owned by the caller", () => {
  const centre = Object.freeze<[number, number, number]>([1, 2, 3])
  const primitive = Object.freeze({ a: centre, b: centre })
  const point = Object.freeze<[number, number, number]>([1.5, 2, 3])
  const normal = getCapsuleSurfaceNormal(point, primitive)
  normal[0] = 99
  expect(getCapsuleSurfaceNormal(point, primitive)).toEqual([1, 0, 0])
  expect(getSphereSurfaceNormal(point, { a: centre })).toEqual([1, 0, 0])
  expect(centre).toEqual([1, 2, 3])
})
