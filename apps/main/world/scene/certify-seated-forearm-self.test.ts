import { expect, it } from "vitest"
import { getSeatedNativePose } from "#/world/scene/get-seated-native-pose"
import { certifySeatedArmSegment } from "#/world/scene/certify-seated-arm-segment"
import { getSeatedArmClearanceError } from "#/world/scene/get-seated-arm-clearance-error"
import { getSeatedForearmSelfError } from "#/world/scene/get-seated-forearm-self-error"
import { solveArmGripPose } from "#/world/scene/figure/solve-arm-grip-pose"
import { nativeArmSurfaces } from "#/world/scene/figure/native-arm-surfaces"
import { buildBody } from "#/world/scene/figure/body"
import { RESIDENTS, RESIDENT_LOOKS } from "#/world/town/residents"
const look = RESIDENT_LOOKS[RESIDENTS.findIndex((resident) => resident.name === "ヴィルヘルム")]
const fixture = () => {
  const pose = getSeatedNativePose({ look, frame: 0, place: { at: [0, 0], height: 0.358, heading: 0 } })
  if (pose instanceof Error) throw pose
  return { ...pose, look, hand: "r", heading: 0, pole: [-1, 1, 0], obstacles: [], selfClearance: true } satisfies Omit<Parameters<typeof certifySeatedArmSegment>[0], "from" | "to">
}

it("rejects a forearm through the torso between clear endpoints even without external obstacles", () => {
  const props = fixture(),
    from: [number, number, number] = [-0.15, 0.6, -0.4],
    to: [number, number, number] = [-0.15, 0.6, 0.1]
  for (const target of [from, to]) {
    const pose = solveArmGripPose({ skeleton: props.skeleton, hand: props.hand, target, pole: props.pole })
    if (pose instanceof Error) throw pose
    expect(getSeatedArmClearanceError({ ...props, skeleton: pose.skeleton, margin: 0, movingHand: props.hand })).toBeNull()
  }
  const middle = solveArmGripPose({ skeleton: props.skeleton, hand: props.hand, target: [-0.15, 0.6, -0.15], pole: props.pole })
  if (middle instanceof Error) throw middle
  const joints = middle.skeleton.p,
    surface = nativeArmSurfaces({ scale: 1, shoulder: joints.upperarm_r, elbow: joints.lowerarm_r, wrist: joints.hand_r }).forearm()
  const body = buildBody(look, middle.skeleton, null),
    moving = new Set(body.armParts.r),
    witness: [number, number, number] = [-0.1, 0.57, -0.18]
  expect(surface.sd(witness)).toBeLessThan(-0.005)
  expect(body.prims.some((primitive) => !moving.has(primitive) && primitive.sd && primitive.sd(witness) < -0.005)).toBe(true)
  expect(certifySeatedArmSegment({ ...props, from, to, selfClearance: false })).not.toBeInstanceOf(Error)
  expect(certifySeatedArmSegment({ ...props, from, to })).toBeInstanceOf(Error)
})

it("certifies a continuous forearm path outside the fixed body", () => {
  expect(certifySeatedArmSegment({ ...fixture(), from: [-0.3, 0.6, -0.4], to: [-0.3, 0.6, -0.1] })).not.toBeInstanceOf(Error)
})
it("refuses a static-body claim with a nonzero motion margin", () => {
  expect(getSeatedForearmSelfError({ ...fixture(), movingHand: null, margin: 0.001 })).toBeInstanceOf(Error)
})
