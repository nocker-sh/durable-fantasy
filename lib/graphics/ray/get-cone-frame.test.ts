import { expect, it } from "vitest"
import { getConeFrame } from "#/lib/graphics/ray/get-cone-frame"
import { getConeRayIntersection } from "#/lib/graphics/ray/get-cone-ray-intersection"
import { getConeSurfaceNormal } from "#/lib/graphics/ray/get-cone-surface-normal"
import type { Primitive } from "#/lib/graphics/ray/primitive-types"

const cone: Primitive = { kind: "cone", a: [0, 0, 0], b: [0, 1, 0], r: 0.5, r2: 0.2, id: 1, m: () => ["test", 0] }

it("shares an immutable derived frame without changing a frozen input", () => {
  const primitive = Object.freeze({ ...cone })
  const keys = Object.keys(primitive)
  const frame = getConeFrame(primitive)
  expect(getConeFrame(primitive)).toBe(frame)
  expect(Object.isFrozen(frame)).toBe(true)
  for (const axis of [frame.u, frame.v, frame.w]) {
    expect(Object.isFrozen(axis)).toBe(true)
    expect(Reflect.set(axis, "0", 9)).toBe(false)
  }
  expect(getConeRayIntersection([0, 2, 0], [0, -1, 0], primitive)).toBe(1)
  expect(getConeSurfaceNormal([0, 1, 0], primitive)).toEqual([0, 1, 0])
  expect(Object.keys(primitive)).toEqual(keys)
})

it("invalidates endpoint edits and replacements before intersection and normal queries", () => {
  const primitive: Primitive = { ...cone, a: [0, 0, 0], b: [0, 1, 0] }
  const original = getConeFrame(primitive)
  getConeRayIntersection([0, 2, 0], [0, -1, 0], primitive)
  primitive.b[1] = 2
  const taller = getConeFrame(primitive)
  expect(taller).not.toBe(original)
  expect(taller.h).toBe(2)
  expect(getConeRayIntersection([0, 3, 0], [0, -1, 0], primitive)).toBe(1)
  primitive.a = [1, 0, 0]
  primitive.b = [3, 0, 0]
  const fresh: Primitive = { ...cone, a: [1, 0, 0], b: [3, 0, 0] }
  expect(getConeFrame(primitive)).toEqual(getConeFrame(fresh))
  expect(getConeSurfaceNormal([3, 0, 0], primitive)).toEqual([1, 0, 0])
  expect(getConeRayIntersection([4, 0, 0], [-1, 0, 0], primitive)).toBe(getConeRayIntersection([4, 0, 0], [-1, 0, 0], fresh))
})

it("returns an owned top normal that cannot corrupt the shared frame", () => {
  const primitive: Primitive = { ...cone }
  const normal = getConeSurfaceNormal([0, 1, 0], primitive)
  normal[0] = 99
  expect(getConeSurfaceNormal([0, 1, 0], primitive)).toEqual([0, 1, 0])
  expect(getConeFrame(primitive).w).toEqual([0, 1, 0])
})

it("accepts fully frozen endpoint values", () => {
  const endpoints = Object.freeze({ a: Object.freeze<[number, number, number]>([0, 0, 0]), b: Object.freeze<[number, number, number]>([0, 1, 0]) })
  expect(getConeFrame(endpoints).h).toBe(1)
  expect(getConeFrame(endpoints).w).toEqual([0, 1, 0])
})
