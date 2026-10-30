import { expect, it } from "vitest"
import { getNativeSingleHandReachPose } from "#/world/scene/figure/get-native-single-hand-reach-pose"
import { skelFor } from "#/world/scene/figure/helpers/animation/skel-for"
import { RESIDENTS, RESIDENT_LOOKS } from "#/world/town/residents"
import { armGripPoint } from "#/world/scene/figure/arm-grip-point"
import { buildBody } from "#/world/scene/figure/body"
import { groundFootwear } from "#/world/scene/figure/footing"
import { toHeadingWorldPoint } from "#/world/scene/to-heading-world-point"
import { BONE_ORDER } from "#/world/scene/rig"

it("supports either native arm without moving shoulders, opposite arm, legs or rest lengths", () => {
  const look = RESIDENT_LOOKS[RESIDENTS.findIndex((resident) => resident.name === "ゾフィー")],
    skeleton = skelFor(look, "idle", 0),
    before = JSON.stringify(skeleton)
  const rootY = groundFootwear(buildBody(look, skeleton, null).footwear).rootY
  for (const hand of ["l", "r"] satisfies ("l" | "r")[]) {
    const target = toHeadingWorldPoint(armGripPoint(skeleton.p[`lowerarm_${hand}`], skeleton.p[`hand_${hand}`]), [1, rootY, 2], Math.PI / 2)
    const pose = getNativeSingleHandReachPose({ look, skeleton, target, body: [1, 2], heading: Math.PI / 2, hand, pole: skeleton.p[`lowerarm_${hand}`] })
    if (pose instanceof Error) throw pose
    for (const bone of BONE_ORDER) if (bone !== `lowerarm_${hand}` && bone !== `hand_${hand}`) expect(pose.skeleton.p[bone]).toEqual(skeleton.p[bone])
    for (const axis of [0, 1, 2]) expect(pose.solution.grip[axis]).toBeCloseTo(armGripPoint(skeleton.p[`lowerarm_${hand}`], skeleton.p[`hand_${hand}`])[axis], 12)
    expect(pose.skeleton.q).toBe(skeleton.q)
    expect(pose.skeleton.rest).toBe(skeleton.rest)
  }
  expect(JSON.stringify(skeleton)).toBe(before)
})

it("refuses non-finite targets, overreaching and stale hand-contact constraints", () => {
  const look = RESIDENT_LOOKS[RESIDENTS.findIndex((resident) => resident.name === "ゾフィー")],
    skeleton = skelFor(look, "idle", 0)
  const props = { look, skeleton, body: [0, 0], heading: 0, hand: "r", pole: [-1, -1, 1], target: [0, 0, 0] } satisfies Parameters<typeof getNativeSingleHandReachPose>[0]
  expect(getNativeSingleHandReachPose({ ...props, target: [2, 2, 2] })).toEqual(new Error("Native single-hand target is unreachable without stretching the arm"))
  expect(getNativeSingleHandReachPose({ ...props, target: [NaN, 0, 0] })).toEqual(new Error("Invalid native single-hand reach"))
  const constrained = { ...skeleton, handGrips: { r: { axis: [1, 0, 0] satisfies [number, number, number], across: [0, 0, 1] satisfies [number, number, number], halfWidth: 0.01, halfDepth: 0.01 } } }
  expect(getNativeSingleHandReachPose({ ...props, skeleton: constrained })).toEqual(new Error("Native single-hand reach must precede contact constraints"))
})
