import { expect, it } from "vitest"
import { getTwoBonePoleSpeedBound } from "./get-two-bone-pole-speed-bound"
import { solveTwoBone } from "./solve-two-bone"

const root = [0, 0, 0] satisfies [number, number, number],
  target = [0, 0, 1] satisfies [number, number, number]
it("bounds the changing elbow through a non-singular quarter turn of the pole", () => {
  const bound = getTwoBonePoleSpeedBound({ root, target, upper: 1, lower: 1, from: [1, 0, 0], to: [0, 1, 0] })
  if (typeof bound !== "number") throw new Error("Missing finite pole speed bound")
  for (const index of Array.from({ length: 99 }).keys()) {
    const t = (index + 1) / 100,
      step = 1e-6
    const a = solveTwoBone({ root: root, target: target, upper: 1, lower: 1, pole: [1 - t + step, t - step, 0] }),
      b = solveTwoBone({ root: root, target: target, upper: 1, lower: 1, pole: [1 - t - step, t + step, 0] })
    if (!a || !b) throw new Error("Reachable pole fixture became unreachable")
    expect(Math.hypot(...b.joint.map((value, axis) => value - a.joint[axis])) / (step * 2)).toBeLessThanOrEqual(bound)
  }
})
it("does not rotate the elbow when the pole moves only along the target axis", () => {
  expect(getTwoBonePoleSpeedBound({ root, target, upper: 1, lower: 1, from: [1, 0, -2], to: [1, 0, 7] })).toBe(0)
})
it("refuses a pole line that flips its bend direction through a singular projection", () => {
  expect(getTwoBonePoleSpeedBound({ root, target, upper: 1, lower: 1, from: [1, 0, 0], to: [-1, 0, 0] })).toBeNull()
})
it("refuses unreachable and degenerate targets and rejects malformed values", () => {
  expect(getTwoBonePoleSpeedBound({ root, target: [0, 0, 3], upper: 1, lower: 1, from: [1, 0, 0], to: [0, 1, 0] })).toBeNull()
  expect(getTwoBonePoleSpeedBound({ root, target: root, upper: 1, lower: 1, from: [1, 0, 0], to: [0, 1, 0] })).toBeNull()
  expect(getTwoBonePoleSpeedBound({ root, target, upper: 1, lower: 1, from: [NaN, 0, 0], to: [0, 1, 0] })).toBeInstanceOf(Error)
})
