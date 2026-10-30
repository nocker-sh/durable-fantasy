import { expect, it } from "vitest"
import { certifyFieldSeparation as separate, type BoundedField } from "#/lib/engine/field-separation"
function ball(x: number, r: number): BoundedField {
  return { min: [x - r, -r, -r], max: [x + r, r, r], value: (p) => Math.hypot(p[0] - x, p[1], p[2]) - r, lipschitz: 1 }
}
it("certifies separated curved surfaces whose enclosing boxes overlap", () => {
  const a = ball(0, 1),
    b = ball(1.5, 1)
  b.value = (p) => Math.hypot(p[0] - 1.5, p[1] - 1.5, p[2]) - 1
  b.min = [0.5, 0.5, -1]
  b.max = [2.5, 2.5, 1]
  expect(separate(a, b)).toBe(true)
})
it("keeps intersections, tangency, expanded levels and nonfinite fields unresolved", () => {
  expect(separate(ball(0, 1), ball(1, 1))).toBe(false)
  expect(separate(ball(0, 1), ball(2, 1))).toBe(false)
  const a = ball(0, 1)
  a.level = 0.1
  a.max = [1.1, 1.1, 1.1]
  a.min = [-1.1, -1.1, -1.1]
  expect(separate(a, ball(2.05, 1))).toBe(false)
  a.value = () => NaN
  expect(separate(a, ball(0, 1))).toBe(false)
})
it("rejects an invalid derivative bound rather than certifying samples", () => {
  const a = ball(0, 1)
  a.lipschitz = 0
  expect(() => separate(a, ball(0, 1))).toThrow("Invalid bounded separation field")
})
