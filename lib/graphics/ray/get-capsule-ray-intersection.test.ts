import { expect, it } from "vitest"
import { getCapsuleRayIntersection } from "./get-capsule-ray-intersection"
import type { Primitive } from "./primitive-types"
const capsule: Primitive = { kind: "cap", a: [0, 0, 0], b: [0, 1, 0], r: 0.5, r2: 0.5, id: 0, m: () => ["test", 0] }

it("hits the near rounded end from either axial direction regardless of endpoint order", () => {
  const reversed = { ...capsule, a: capsule.b, b: capsule.a }
  for (const primitive of [capsule, reversed]) {
    expect(getCapsuleRayIntersection([0, 3, 0], [0, -1, 0], primitive)).toBe(1.5)
    expect(getCapsuleRayIntersection([0, -3, 0], [0, 1, 0], primitive)).toBe(2.5)
  }
})

it("retains side hits, misses and a zero-length capsule's sphere entry", () => {
  expect(getCapsuleRayIntersection([2, 0.5, 0], [-1, 0, 0], capsule)).toBe(1.5)
  expect(getCapsuleRayIntersection([2, 0.5, 2], [-1, 0, 0], capsule)).toBe(-1)
  expect(getCapsuleRayIntersection([0, 0, 3], [0, 0, -1], { ...capsule, b: capsule.a })).toBe(2.5)
})
