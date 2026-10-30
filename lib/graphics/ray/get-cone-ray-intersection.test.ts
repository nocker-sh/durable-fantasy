import { expect, it } from "vitest"
import { getConeRayIntersection } from "./get-cone-ray-intersection"
import type { PrimitiveShape } from "./primitive-types"
import type { Vector3 } from "../../engine/vector3-types"
const cone: PrimitiveShape = { kind: "cone", a: [0, 0, 0], b: [0, 0, 1], r: 1, r2: 0.5 }

it("selects the forward side root, including a ray starting inside the surface", () => {
  expect(getConeRayIntersection([2, 0, 0.5], [-1, 0, 0], cone)).toBe(1.25)
  expect(getConeRayIntersection([0, 0, 0.5], [1, 0, 0], cone)).toBe(0.75)
  expect(getConeRayIntersection([2, 0, 0.5], [1, 0, 0], cone)).toBe(-1)
})

it("retains tangent sides and the inclusive rim at the top plane", () => {
  expect(getConeRayIntersection([0.75, -2, 0.5], [0, 1, 0], cone)).toBe(2)
  expect(getConeRayIntersection([0.5, 0, 2], [0, 0, -1], cone)).toBe(1)
  expect(getConeRayIntersection([2, 0, 1], [-1, 0, 0], cone)).toBe(1.5)
})

it("hits the top on an axial ray and retains the intentionally open bottom", () => {
  expect(getConeRayIntersection([0, 0, 2], [0, 0, -1], cone)).toBe(1)
  expect(getConeRayIntersection([0, 0, -1], [0, 0, 1], cone)).toBe(2)
})

it("reads frozen ray coordinates without changing them or the primitive", () => {
  const origin: Vector3 = Object.freeze([2, 0, 0.5])
  const direction: Vector3 = Object.freeze([-1, 0, 0])
  const primitive = Object.freeze({ ...cone })
  expect(getConeRayIntersection(origin, direction, primitive)).toBe(1.25)
  expect(origin).toEqual([2, 0, 0.5])
  expect(direction).toEqual([-1, 0, 0])
  expect(Object.keys(primitive)).toEqual(Object.keys(cone))
})
