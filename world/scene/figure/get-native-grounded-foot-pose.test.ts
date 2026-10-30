import { expect, it } from "vitest"
import { RESIDENTS, RESIDENT_LOOKS } from "#/world/town/residents"
import { skelFor } from "#/world/scene/figure/helpers/animation/skel-for"
import { buildBody } from "#/world/scene/figure/body"
import { groundFootwear } from "#/world/scene/figure/footing"
import { getNativeGroundedFootPose } from "#/world/scene/figure/get-native-grounded-foot-pose"
import { getNativeFootClearanceError } from "#/world/scene/figure/get-native-foot-clearance-error"

it("distinguishes grounding one native shoe from preparing both shoes for support", () => {
  for (const name of ["ヴィルヘルム", "ゾフィー"]) {
    const look = RESIDENT_LOOKS[RESIDENTS.findIndex((resident) => resident.name === name)],
      skeleton = skelFor(look, "idle", 0),
      offsets = { body: 0, l: [0, 0, 0], r: [0, 0, 0] } satisfies Parameters<typeof getNativeGroundedFootPose>[0]["offsets"]
    const rootY = groundFootwear(buildBody(look, skeleton, null).footwear).rootY
    expect(getNativeFootClearanceError({ look, skeleton, rootY, offsets })).toBeInstanceOf(Error)
    const pose = getNativeGroundedFootPose({ look, skeleton, offsets, pelvisDrop: 0.02 })
    if (pose instanceof Error) throw pose
    expect(getNativeFootClearanceError({ ...pose, look })).toBeNull()
    const foot = pose.skeleton.p.foot_l,
      ball = pose.skeleton.p.ball_l
    const raisedFoot: [number, number, number] = [foot[0], foot[1] + 0.01, foot[2]],
      raisedBall: [number, number, number] = [ball[0], ball[1] + 0.01, ball[2]]
    expect(getNativeFootClearanceError({ ...pose, look, skeleton: { ...pose.skeleton, p: { ...pose.skeleton.p, foot_l: raisedFoot, ball_l: raisedBall } } })).toBeInstanceOf(Error)
  }
})

it("rejects below-floor targets, invalid offsets and already certified hand constraints", () => {
  const look = RESIDENT_LOOKS[RESIDENTS.findIndex((resident) => resident.name === "ゾフィー")],
    skeleton = skelFor(look, "idle", 0)
  const props = { look, skeleton, offsets: { body: 0, l: [0, 0, 0], r: [0, 0, 0] }, pelvisDrop: 0.02 } satisfies Parameters<typeof getNativeGroundedFootPose>[0]
  expect(getNativeGroundedFootPose({ ...props, offsets: { ...props.offsets, l: [0, -0.01, 0] } })).toBeInstanceOf(Error)
  expect(getNativeGroundedFootPose({ ...props, offsets: { ...props.offsets, r: [NaN, 0, 0] } })).toBeInstanceOf(Error)
  expect(getNativeGroundedFootPose({ ...props, pelvisDrop: -1 })).toBeInstanceOf(Error)
  const constrained = { ...skeleton, handGrips: { r: { axis: [1, 0, 0] satisfies [number, number, number], across: [0, 0, 1] satisfies [number, number, number], halfWidth: 0.01, halfDepth: 0.01 } } }
  expect(getNativeGroundedFootPose({ ...props, skeleton: constrained })).toEqual(new Error("Native foot placement must precede hand contact constraints"))
})
