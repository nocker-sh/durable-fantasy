import { expect, it, vi } from "vitest"
import * as armShapes from "#/world/scene/figure/native-arm-surfaces"
import { getForearmSelfClearanceError } from "#/world/scene/figure/get-forearm-self-clearance-error"
import { getSeatedNativePose } from "#/world/scene/get-seated-native-pose"
import { buildBody } from "#/world/scene/figure/body"
import { nativeArmSurfaces } from "#/world/scene/figure/native-arm-surfaces"
import { armGripPoint } from "#/world/scene/figure/arm-grip-point"
import { solveArmGripPose } from "#/world/scene/figure/solve-arm-grip-pose"
import { RESIDENTS, RESIDENT_LOOKS } from "#/world/town/residents"
const names = ["ヴィルヘルム", "ゾフィー"]

it("detects actual native lap intersections, rather than only overlapping bounding envelopes", () => {
  for (const name of names) {
    const look = RESIDENT_LOOKS[RESIDENTS.findIndex((resident) => resident.name === name)]
    const pose = getSeatedNativePose({ look, frame: 0, place: { at: [0, 0], height: 0.358, heading: 0 } })
    if (pose instanceof Error) throw pose
    const joints = pose.skeleton.p,
      shape = nativeArmSurfaces({ scale: 1, shoulder: joints.upperarm_r, elbow: joints.lowerarm_r, wrist: joints.hand_r })
    const witness: [number, number, number] = name === names[0] ? [-0.095, 0.435, -0.045] : [-0.085, 0.43, -0.055]
    const body = buildBody(look, pose.skeleton, null),
      armParts = new Set(body.armParts.r)
    expect(shape.forearm().sd(witness)).toBeLessThan(-0.03)
    expect(body.prims.some((primitive) => !armParts.has(primitive) && primitive.sd && primitive.sd(witness) < -0.03)).toBe(true)
    expect(getForearmSelfClearanceError({ look, skeleton: pose.skeleton, hand: "r", margin: 0 })).toBeInstanceOf(Error)
  }
})

it("can certify a separated fixed-length candidate in every frame without adopting it as the native resting pose", () => {
  for (const name of names)
    for (const frame of Array.from({ length: 17 }).keys()) {
      const look = RESIDENT_LOOKS[RESIDENTS.findIndex((resident) => resident.name === name)]
      const pose = getSeatedNativePose({ look, frame, place: { at: [0, 0], height: 0.358, heading: 0 } })
      if (pose instanceof Error) throw pose
      const joints = pose.skeleton.p,
        grip = armGripPoint(joints.lowerarm_r, joints.hand_r)
      const candidate = solveArmGripPose({ skeleton: pose.skeleton, hand: "r", target: [grip[0] - 0.1, grip[1] + 0.15, grip[2] + 0.1], pole: joints.lowerarm_r })
      if (candidate instanceof Error) throw candidate
      expect(getForearmSelfClearanceError({ look, skeleton: candidate.skeleton, hand: "r", margin: 0 })).toBeNull()
      expect(getForearmSelfClearanceError({ look, skeleton: candidate.skeleton, hand: "r", margin: -1 })).toBeInstanceOf(Error)
    }
})

it("constructs the same fixed forearm field once for all native body parts", () => {
  const look = RESIDENT_LOOKS[RESIDENTS.findIndex((resident) => resident.name === "ゾフィー")],
    pose = getSeatedNativePose({ look, frame: 0, place: { at: [0, 0], height: 0.358, heading: 0 } })
  if (pose instanceof Error) throw pose
  const joints = pose.skeleton.p,
    grip = armGripPoint(joints.lowerarm_r, joints.hand_r),
    candidate = solveArmGripPose({ skeleton: pose.skeleton, hand: "r", target: [grip[0] - 0.1, grip[1] + 0.15, grip[2] + 0.1], pole: joints.lowerarm_r })
  if (candidate instanceof Error) throw candidate
  const counts = { forearm: 0 },
    original = armShapes.nativeArmSurfaces,
    factory = vi.spyOn(armShapes, "nativeArmSurfaces").mockImplementation((...arguments_) => {
      const shape = original(...arguments_)
      return {
        ...shape,
        forearm: () => {
          counts.forearm += 1
          return shape.forearm()
        },
      }
    })
  try {
    expect(getForearmSelfClearanceError({ look, skeleton: candidate.skeleton, hand: "r", margin: 0 })).toBeNull()
    expect(counts.forearm).toBe(1)
  } finally {
    factory.mockRestore()
  }
})
