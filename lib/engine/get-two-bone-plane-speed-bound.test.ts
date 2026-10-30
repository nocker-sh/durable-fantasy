import { expect, it } from "vitest"
import { getTwoBonePlaneSpeedBound } from "./get-two-bone-plane-speed-bound"
import { solveTwoBoneOnPlane } from "./solve-two-bone-on-plane"
import type { Point3 } from "./cuboid-motion-types"
const distance = (first: Point3, second: Point3) => Math.hypot(...first.map((value, index) => value - second[index]))

it("bounds the actual planar elbow curve for cardinal and oblique fixed planes", () => {
  for (const normal of [
    [0, 1, 0],
    [0, -2, 0],
    [1, 2, -3],
  ] satisfies Point3[]) {
    const from: Point3 = [0.1875, 0.125, 0.0625],
      to: Point3 = [0.21875, 0.109375, 0.0625]
    const endpoints = normal[0] === 0 ? { from: [0.2, 0.08, 0] satisfies Point3, to: [0.2, 0.08, 0.02] satisfies Point3 } : { from, to }
    const props = { root: [0, 0, 0] satisfies Point3, pole: [0, 1, 1] satisfies Point3, normal, upper: 0.2, lower: 0.22, ...endpoints }
    const before = JSON.stringify(props),
      bound = getTwoBonePlaneSpeedBound(props)
    if (bound instanceof Error) throw bound
    expect(bound).toBeGreaterThan(0)
    const joints = Array.from({ length: 65 }, (_, index) => {
      const t = index / 64,
        target: Point3 = [endpoints.from[0] * (1 - t) + endpoints.to[0] * t, endpoints.from[1] * (1 - t) + endpoints.to[1] * t, endpoints.from[2] * (1 - t) + endpoints.to[2] * t]
      const solved = solveTwoBoneOnPlane({ ...props, target })
      if (solved instanceof Error) throw solved
      return solved.joint
    })
    for (const index of joints.keys()) if (index) expect(distance(joints[index], joints[index - 1]) * 64).toBeLessThanOrEqual(bound)
    expect(JSON.stringify(props)).toBe(before)
  }
})

it("rejects unreachable interiors and a bend branch that crosses a singular pole", () => {
  const props = {
    root: [0, 0.08, 0] satisfies Point3,
    from: [-0.1, 0, 0] satisfies Point3,
    to: [0.1, 0, 0] satisfies Point3,
    normal: [0, 1, 0] satisfies Point3,
    pole: [0, 0, 1] satisfies Point3,
    upper: 0.17,
    lower: 0.2,
  }
  expect(solveTwoBoneOnPlane({ ...props, target: props.from })).not.toBeInstanceOf(Error)
  expect(solveTwoBoneOnPlane({ ...props, target: props.to })).not.toBeInstanceOf(Error)
  expect(getTwoBonePlaneSpeedBound(props)).toBeInstanceOf(Error)
  expect(getTwoBonePlaneSpeedBound({ ...props, root: [0, 0, 0], from: [0.2, 0, -0.02], to: [0.2, 0, 0.02], pole: [1, 0, 0] })).toBeInstanceOf(Error)
})

it("does not project a drifting plane back into place or accept invalid geometry", () => {
  const props = {
    root: [0, 0, 0] satisfies Point3,
    from: [0.2, 0.08, 0] satisfies Point3,
    to: [0.2, 0.08, 0.02] satisfies Point3,
    normal: [0, 1, 0] satisfies Point3,
    pole: [0, 1, 1] satisfies Point3,
    upper: 0.2,
    lower: 0.22,
  }
  expect(getTwoBonePlaneSpeedBound({ ...props, to: [0.2, 0.0800000000001, 0.02] })).toBeInstanceOf(Error)
  for (const normal of [
    [0, 0, 0],
    [NaN, 0, 0],
  ] satisfies Point3[])
    expect(getTwoBonePlaneSpeedBound({ ...props, normal })).toBeInstanceOf(Error)
  expect(getTwoBonePlaneSpeedBound({ ...props, upper: 0.01 })).toBeInstanceOf(Error)
  expect(getTwoBonePlaneSpeedBound({ ...props, to: props.from })).toBe(0)
})
