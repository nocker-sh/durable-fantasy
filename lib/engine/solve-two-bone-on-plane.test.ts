import { expect, it } from "vitest"
import { solveTwoBoneOnPlane } from "./solve-two-bone-on-plane"
import { solveTwoBone } from "./solve-two-bone"
import { qfromTo } from "./qfrom-to"
import { qrot } from "./qrot"
import type { Point3 } from "./cuboid-motion-types"
const distance = (first: Point3, second: Point3) => Math.hypot(...first.map((value, index) => value - second[index]))

it("preserves link lengths and the target plane under arbitrary rotations and translations", () => {
  for (const normal of [
    [0, 1, 0],
    [1, 0, 0],
    [0, -1, 0],
    [1, 2, -3],
  ] satisfies Point3[]) {
    const rotation = qfromTo([0, 1, 0], normal),
      offset: Point3 = [-0.3, 0.7, 2]
    const point = (value: Point3): Point3 => {
      const rotated = qrot(rotation, value)
      return [rotated[0] + offset[0], rotated[1] + offset[1], rotated[2] + offset[2]]
    }
    const root = point([0, 0, 0]),
      target = point([0.25, 0.1, 0.05]),
      pole = point([0, 1, 1])
    const before = JSON.stringify({ root, target, pole, normal }),
      solved = solveTwoBoneOnPlane({ root, target, pole, normal, upper: 0.18, lower: 0.2 })
    if (solved instanceof Error) throw solved
    expect(distance(root, solved.joint)).toBeCloseTo(0.18, 12)
    expect(distance(solved.joint, solved.end)).toBeCloseTo(0.2, 12)
    expect(solved.end).toEqual(target)
    expect(solved.joint.reduce((sum, value, axis) => sum + (value - target[axis]) * normal[axis], 0)).toBeCloseTo(0, 12)
    expect(JSON.stringify({ root, target, pole, normal })).toBe(before)
  }
})

it("rejects a plane that cannot be reached even when the unconstrained chain reaches the target", () => {
  const root: Point3 = [0, 0, 0],
    target: Point3 = [0.1, 0.18, 0],
    pole: Point3 = [0, 0, 1]
  expect(solveTwoBone({ root: root, target: target, upper: 0.17, lower: 0.2, pole: pole })).toBeDefined()
  expect(solveTwoBoneOnPlane({ root, target, pole, normal: [0, 1, 0], upper: 0.17, lower: 0.2 })).toBeInstanceOf(Error)
  const folded = solveTwoBoneOnPlane({ root, target: root, pole, normal: [0, 1, 0], upper: 0.2, lower: 0.2 })
  if (folded instanceof Error) throw folded
  expect(distance(root, folded.joint)).toBeCloseTo(0.2, 12)
  expect(folded.joint[1]).toBeCloseTo(0, 12)
})

it("rejects nonfinite and degenerate constraints instead of producing a stretched or invalid solution", () => {
  const props = { root: [0, 0, 0] satisfies Point3, target: [0.2, 0.1, 0] satisfies Point3, pole: [0, 0, 1] satisfies Point3, normal: [0, 1, 0] satisfies Point3, upper: 0.18, lower: 0.2 }
  for (const normal of [
    [0, 0, 0],
    [NaN, 0, 0],
    [Infinity, 0, 0],
  ] satisfies Point3[])
    expect(solveTwoBoneOnPlane({ ...props, normal })).toBeInstanceOf(Error)
  for (const upper of [0, -1, NaN, Infinity]) expect(solveTwoBoneOnPlane({ ...props, upper })).toBeInstanceOf(Error)
})
