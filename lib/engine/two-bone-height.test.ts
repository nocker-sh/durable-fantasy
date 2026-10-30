import { expect, it } from "vitest"
import { solveTwoBoneAtHeight } from "#/lib/engine/solve-two-bone-at-height"
const distance = (a: readonly number[], b: readonly number[]) => Math.hypot(...a.map((v, i) => v - b[i]))
it("meets the requested height and both fixed lengths, choosing the pole's side", () => {
  for (const sign of [-1, 1]) {
    const root: [number, number, number] = [0, 1, 0],
      target: [number, number, number] = [0, 0, 1],
      s = solveTwoBoneAtHeight({ root: root, target: target, upper: 1, lower: 1, pole: [sign, 0, 0], height: 0.25 })!
    expect(s.joint[1]).toBe(0.25)
    expect(s.joint[0] * sign).toBeGreaterThan(0)
    expect(distance(root, s.joint)).toBeCloseTo(1, 12)
    expect(distance(target, s.joint)).toBeCloseTo(1, 12)
  }
})
it("handles coincident horizontal centres and tangent circles", () => {
  expect(solveTwoBoneAtHeight({ root: [0, 1, 0], target: [0, -1, 0], upper: Math.SQRT2, lower: Math.SQRT2, pole: [1, 0, 0], height: 0 })!.joint[0]).toBeCloseTo(1, 12)
  expect(solveTwoBoneAtHeight({ root: [0, 0, 0], target: [2, 0, 0], upper: 1, lower: 1, pole: [1, 1, 0], height: 0 })!.joint).toEqual([1, 0, 0])
  expect(solveTwoBoneAtHeight({ root: [0, 0, 0], target: [0, 0, 0], upper: 1, lower: 1, pole: [1, 0, 0], height: 0.5 })!.joint[0]).toBeCloseTo(Math.sqrt(0.75), 12)
})
it("rejects incompatible heights and unreachable circles", () => {
  expect(solveTwoBoneAtHeight({ root: [0, 0, 0], target: [2, 0, 0], upper: 1, lower: 1, pole: [0, 0, 1], height: 0.1 })).toBeUndefined()
  expect(solveTwoBoneAtHeight({ root: [0, 0, 0], target: [1, 0, 0], upper: 1, lower: 1, pole: [0, 0, 1], height: 2 })).toBeUndefined()
  expect(solveTwoBoneAtHeight({ root: [0, 1, 0], target: [0, -1, 0], upper: 1, lower: 1, pole: [1, 0, 0], height: 0.5 })).toBeUndefined()
  expect(() => solveTwoBoneAtHeight({ root: [0, 0, 0], target: [1, 0, 0], upper: 1, lower: 1, pole: [0, 0, 1], height: NaN })).toThrow("Invalid")
})
