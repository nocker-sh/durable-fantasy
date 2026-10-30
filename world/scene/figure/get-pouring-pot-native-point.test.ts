import { expect, it } from "vitest"
import { getPouringPotNativePoint } from "#/world/scene/figure/get-pouring-pot-native-point"
import type { getPouringPotPose } from "#/world/town/get-pouring-pot-pose"
type Pose = Exclude<ReturnType<typeof getPouringPotPose>, Error>

it("keeps the rigid pot transform and actor grounding in separate coordinate frames", () => {
  const pose: Pose = { at: [2, 1, 3], rotation: [0, 0, 0, 1], lipAt: [2, 1, 3], gripAt: [2, 1, 3] }
  expect(getPouringPotNativePoint({ point: [0.1, 0.2, 0.3], pose, body: [1, 2], rootY: 0.1, heading: 0 })).toEqual([expect.closeTo(1.1, 12), expect.closeTo(1.1, 12), expect.closeTo(1.3, 12)])
  expect(pose.at).toEqual([2, 1, 3])
})
it("rotates an actual axis before undoing the operator's heading", () => {
  const half = Math.sqrt(0.5),
    pose: Pose = { at: [2, 1, 3], rotation: [0, half, 0, half], lipAt: [2, 1, 3], gripAt: [2, 1, 3] }
  const native = getPouringPotNativePoint({ point: [1, 0, 0], pose, body: [2, 1], rootY: 0.25, heading: Math.PI })
  expect(native[0]).toBeCloseTo(0, 12)
  expect(native[1]).toBeCloseTo(0.75, 12)
  expect(native[2]).toBeCloseTo(-1, 12)
})
