import { expect, it } from "vitest"
import { solveTwoBone } from "./solve-two-bone"
import { twoBoneJointSpeedBound } from "./two-bone-joint-speed-bound"
type V3 = [number, number, number]
it("bounds joint displacement along curved joint paths over a target segment", () => {
  const root: V3 = [0, 0, 0],
    pole: V3 = [0, 1, 1]
  for (const [a, b] of [
    [
      [0.15, 0.1, 0.1],
      [0.25, 0.1, -0.05],
    ],
    [
      [-0.2, 0.1, 0.1],
      [0.2, 0.15, 0.1],
    ],
    [
      [0.1, 0.1, 0.1],
      [0.11, 0.11, 0.11],
    ],
  ] as [V3, V3][]) {
    const bound = twoBoneJointSpeedBound({ root: root, from: a, to: b, upper: 0.2, lower: 0.2, pole: pole })!
    expect(bound).toBeGreaterThan(0)
    let previous = solveTwoBone({ root: root, target: a, upper: 0.2, lower: 0.2, pole: pole })!.joint
    for (let i = 1; i <= 200; i++) {
      const target = a.map((v, j) => v + ((b[j] - v) * i) / 200) as V3,
        joint = solveTwoBone({ root: root, target: target, upper: 0.2, lower: 0.2, pole: pole })!.joint
      expect(Math.hypot(...joint.map((v, j) => v - previous[j]))).toBeLessThanOrEqual(bound / 200 + 1e-12)
      previous = joint
    }
  }
})
it("keeps singular or unreachable moving intervals unresolved", () => {
  expect(twoBoneJointSpeedBound({ root: [0, 0, 0], from: [1, 0, 0], to: [1.5, 0, 0], upper: 1, lower: 1, pole: [2, 0, 0] })).toBeUndefined()
  expect(twoBoneJointSpeedBound({ root: [0, 0, 0], from: [1, 0, 0], to: [3, 0, 0], upper: 1, lower: 1, pole: [0, 1, 0] })).toBeUndefined()
  expect(twoBoneJointSpeedBound({ root: [0, 0, 0], from: [0, 0, 0], to: [0, 0, 0], upper: 1, lower: 1, pole: [0, 0, 0] })).toBe(0)
  expect(() => twoBoneJointSpeedBound({ root: [0, 0, 0], from: [1, 0, 0], to: [1.5, 0, 0], upper: 1, lower: 1, pole: [NaN, 0, 0] })).toThrow("Invalid")
})
