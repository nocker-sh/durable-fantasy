import { expect, it } from "vitest"
import { solveTwoBone } from "#/lib/engine/solve-two-bone"
const distance = (a: readonly number[], b: readonly number[]) => Math.hypot(...a.map((v, i) => v - b[i]))
it("preserves both link lengths and reaches the endpoint with the bend toward its pole", () => {
  const root = [0, 0, 0] as const,
    target = [0.2, 0.1, 0] as const,
    result = solveTwoBone({ root: root, target: target, upper: 0.17, lower: 0.2, pole: [0, 0, 1] })!
  expect(distance(root, result.joint)).toBeCloseTo(0.17, 12)
  expect(distance(result.joint, result.end)).toBeCloseTo(0.2, 12)
  expect(result.end).toEqual(target)
  expect(result.joint[2]).toBeGreaterThan(0)
  expect(solveTwoBone({ root: root, target: [0, 0.4, 0], upper: 0.17, lower: 0.2, pole: [0, 0, 1] })).toBeUndefined()
  expect(solveTwoBone({ root: root, target: [0, 0.01, 0], upper: 0.17, lower: 0.2, pole: [0, 0, 1] })).toBeUndefined()
})
it("handles a collinear pole and a completely folded equal-length chain", () => {
  for (const target of [
    [0.3, 0, 0],
    [0, 0, 0],
  ] as const) {
    const r = solveTwoBone({ root: [0, 0, 0], target: target, upper: 0.2, lower: 0.2, pole: [1, 0, 0] })!
    expect(distance([0, 0, 0], r.joint)).toBeCloseTo(0.2)
    expect(distance(r.joint, r.end)).toBeCloseTo(0.2)
  }
  expect(() => solveTwoBone({ root: [0, 0, 0], target: [1, 0, 0], upper: 0, lower: 0.2, pole: [0, 0, 1] })).toThrow("Invalid")
})
