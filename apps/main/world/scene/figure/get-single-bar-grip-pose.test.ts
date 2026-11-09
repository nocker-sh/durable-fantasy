import { expect, it } from "vitest"
import { getSingleBarGripPose } from "#/world/scene/figure/get-single-bar-grip-pose"
import { getRoundBarContactError } from "#/world/scene/figure/get-round-bar-contact-error"
import { getCertifiedSingleBarBodyError } from "#/world/scene/figure/get-certified-single-bar-body-error"
import { buildBody } from "#/world/scene/figure/body"
import { createBodyContext } from "#/world/scene/figure/context"
import { skelFor } from "#/world/scene/figure/helpers/animation/skel-for"
import { RESIDENTS, RESIDENT_LOOKS } from "#/world/town/residents"
import { BONE_ORDER } from "#/world/scene/rig"

it("certifies either single native palm without changing the opposite arm, shoulders or legs", () => {
  const look = RESIDENT_LOOKS[RESIDENTS.findIndex((resident) => resident.name === "ゾフィー")],
    skeleton = skelFor(look, "idle", 0),
    before = JSON.stringify(skeleton)
  for (const hand of ["l", "r"] satisfies ("l" | "r")[]) {
    const side = { l: 1, r: -1 },
      x = side[hand] * 0.12,
      target: [number, number, number] = [x, 0.79, 0.2]
    const bar = { from: [x, 0.68, 0.2], to: [x, 0.9, 0.2], radius: 0.007 } satisfies Parameters<typeof getSingleBarGripPose>[0]["bar"]
    const posed = getSingleBarGripPose({ look, skeleton, hand, target, pole: [side[hand], -1, 1], bar })
    if (posed instanceof Error) throw posed
    expect(getRoundBarContactError({ skeleton: posed.skeleton, hand, bar })).toBeNull()
    expect(getCertifiedSingleBarBodyError({ body: buildBody(look, posed.skeleton, null), skeleton: posed.skeleton, bodyScale: createBodyContext(look, skeleton, null).S, bar, hand })).toBeNull()
    for (const bone of BONE_ORDER) if (bone !== `lowerarm_${hand}` && bone !== `hand_${hand}`) expect(posed.skeleton.p[bone]).toEqual(skeleton.p[bone])
    expect(posed.skeleton.q).toBe(skeleton.q)
    expect(posed.skeleton.rest).toBe(skeleton.rest)
  }
  expect(JSON.stringify(skeleton)).toBe(before)
})

it("rejects wood wider than the real palm and invalid bar geometry", () => {
  const look = RESIDENT_LOOKS[RESIDENTS.findIndex((resident) => resident.name === "ゾフィー")],
    skeleton = skelFor(look, "idle", 0)
  const props = { look, skeleton, hand: "r", target: [-0.12, 0.79, 0.2], pole: [-1, -1, 1], bar: { from: [-0.12, 0.68, 0.2], to: [-0.12, 0.9, 0.2], radius: 0.007 } } satisfies Parameters<
    typeof getSingleBarGripPose
  >[0]
  expect(getSingleBarGripPose({ ...props, bar: { ...props.bar, radius: 0.1 } })).toBeInstanceOf(Error)
  expect(getSingleBarGripPose({ ...props, bar: { ...props.bar, radius: NaN } })).toBeInstanceOf(Error)
  expect(getSingleBarGripPose({ ...props, bar: { ...props.bar, to: props.bar.from } })).toBeInstanceOf(Error)
})
