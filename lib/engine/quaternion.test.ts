import { expect, it } from "vitest"
import { qfromTo } from "#/lib/engine/qfrom-to"
import { qmul } from "#/lib/engine/qmul"
import { qrot } from "#/lib/engine/qrot"
import { type Q } from "#/lib/engine/quaternion-types"
type V3 = [number, number, number]
const unit = (v: V3) => {
  const n = Math.hypot(...v)
  return v.map((x) => x / n) as V3
}
it("maps arbitrary, parallel and antiparallel directions without changing vector length", () => {
  const directions: V3[] = [
    [1, 0, 0],
    [-1, 0, 0],
    [0, 1, 0],
    [0, 0, -1],
    [0.2, 0.7, -0.4],
    [-0.2, -0.7, 0.4],
    [1, 1e-10, 0],
    [-1, 1e-10, 0],
  ]
  for (const a of directions)
    for (const b of directions) {
      const q = qfromTo(a, b),
        got = qrot(q, unit(a)),
        want = unit(b)
      expect(Math.hypot(...q)).toBeCloseTo(1, 12)
      expect(Math.hypot(...got.map((v, i) => v - want[i]))).toBeLessThan(1e-12)
    }
})
it("composes rotations in the documented order", () => {
  const a = qfromTo([0, 0, 1], [0.3, 0.4, 0.5]),
    b = qfromTo([1, 0, 0], [0, 1, 0]),
    v: V3 = [0.3, -0.7, 1.2]
  const got = qrot(qmul(a, b), v),
    want = qrot(a, qrot(b, v))
  expect(Math.hypot(...got.map((v, i) => v - want[i]))).toBeLessThan(1e-12)
  const identity: Q = [0, 0, 0, 1]
  expect(qmul(a, identity)).toEqual(a)
})
it("rejects missing or non-finite directions", () => {
  for (const v of [
    [0, 0, 0],
    [NaN, 0, 1],
    [0, Infinity, 1],
  ] as V3[]) {
    expect(() => qfromTo(v, [0, 0, 1])).toThrow("Invalid rotation direction")
    expect(() => qfromTo([0, 0, 1], v)).toThrow("Invalid rotation direction")
  }
})
