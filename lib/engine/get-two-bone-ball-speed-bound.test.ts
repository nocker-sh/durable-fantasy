import { expect, it } from "vitest"
import { getTwoBoneBallRange } from "./get-two-bone-ball-range"
import { getTwoBoneBallSpeedBound } from "./get-two-bone-ball-speed-bound"
import { solveTwoBone } from "./solve-two-bone"
import type { Point3 } from "./cuboid-motion-types"

it("bounds a regular curved target's actual knee speed over the entire enclosing ball", () => {
  const props = { root: [0, 0, 0], target: [0.8, 0.1, 0.1], radius: 0.04, upper: 0.7, lower: 0.6, pole: [0, 1, 0], targetSpeed: 0.3 } satisfies Parameters<typeof getTwoBoneBallSpeedBound>[0]
  const bound = getTwoBoneBallSpeedBound(props)
  if (bound instanceof Error) throw bound
  const joints: Point3[] = []
  for (const index of Array.from({ length: 101 }).keys()) {
    const t = index / 100,
      target: Point3 = [0.8 + 0.03 * Math.cos(2 * Math.PI * t), 0.1 + 0.02 * Math.sin(2 * Math.PI * t), 0.1 + 0.01 * Math.sin(4 * Math.PI * t)]
    expect(Math.hypot(...target.map((value, axis) => value - props.target[axis]))).toBeLessThan(props.radius)
    const solved = solveTwoBone({ root: props.root, target: target, upper: props.upper, lower: props.lower, pole: props.pole })
    if (!solved) throw new Error("Regular ball lost a target")
    if (joints.length) expect(Math.hypot(...solved.joint.map((value, axis) => value - joints[joints.length - 1][axis]))).toBeLessThanOrEqual(bound / 100)
    joints.push(solved.joint)
  }
})

it("rejects an inner unreachable ball hidden between two reachable endpoints", () => {
  const root: Point3 = [0, 0, 0],
    pole: Point3 = [0, 1, 0]
  for (const x of [-0.2, 0.2]) expect(solveTwoBone({ root: root, target: [x, 0.01, 0], upper: 1, lower: 0.9, pole: pole })).toBeDefined()
  expect(solveTwoBone({ root: root, target: [0, 0.01, 0], upper: 1, lower: 0.9, pole: pole })).toBeUndefined()
  expect(getTwoBoneBallRange({ root, pole, target: [0, 0.01, 0], radius: 0.2, upper: 1, lower: 0.9 })).toEqual(new Error("Two-bone target ball leaves regular reach"))
})

it("rejects outer reach and a pole fallback hidden inside the target domain", () => {
  const props = { root: [0, 0, 0], target: [0.9, 0, 0], radius: 0.11, upper: 0.5, lower: 0.5, pole: [0, 1, 0] } satisfies Parameters<typeof getTwoBoneBallRange>[0]
  for (const y of [-0.1, 0.1]) expect(solveTwoBone({ root: props.root, target: [0.9, y, 0], upper: props.upper, lower: props.lower, pole: props.pole })).toBeDefined()
  expect(getTwoBoneBallRange(props)).toBeInstanceOf(Error)
  expect(getTwoBoneBallRange({ ...props, target: [0.7, 0.01, 0], radius: 0.02, pole: [1, 0, 0] })).toEqual(new Error("Two-bone target ball reaches a singular pole"))
})

it("refuses non-finite dimensions, invalid speeds and numeric overflow", () => {
  const props = { root: [0, 0, 0], target: [0.8, 0.1, 0.1], radius: 0.01, upper: 0.7, lower: 0.6, pole: [0, 1, 0], targetSpeed: 0.3 } satisfies Parameters<typeof getTwoBoneBallSpeedBound>[0]
  for (const targetSpeed of [-1, NaN, Infinity]) expect(getTwoBoneBallSpeedBound({ ...props, targetSpeed })).toBeInstanceOf(Error)
  for (const radius of [-1, NaN, Infinity]) expect(getTwoBoneBallSpeedBound({ ...props, radius })).toBeInstanceOf(Error)
  expect(getTwoBoneBallSpeedBound({ ...props, upper: 0 })).toBeInstanceOf(Error)
  expect(getTwoBoneBallSpeedBound({ ...props, upper: 1e308, lower: 1e308 })).toBeInstanceOf(Error)
})
