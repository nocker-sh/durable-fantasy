import { expect, it } from "vitest"
import { RESIDENTS, RESIDENT_LOOKS } from "#/world/town/residents"
import { skelFor } from "#/world/scene/figure/helpers/animation/skel-for"
import { kneelingPose } from "#/world/scene/figure/kneeling"
import { buildBody } from "#/world/scene/figure/body"
import { groundFootwear } from "#/world/scene/figure/footing"
import { getNativeGroundContacts } from "#/world/scene/figure/get-native-ground-contacts"
import { getNativePlantedContactError } from "#/world/scene/figure/get-native-planted-contact-error"
import type { NativeGroundPose } from "#/world/scene/figure/native-ground-contact-types"

it("distinguishes stationary planted contacts from a translated actor that is still grounded", () => {
  for (const owner of [
    { name: "ヴィルヘルム", drop: 0.015 },
    { name: "ゾフィー", drop: 0.02 },
  ]) {
    const look = RESIDENT_LOOKS[RESIDENTS.findIndex((resident) => resident.name === owner.name)],
      skeleton = kneelingPose(look, skelFor(look, "scrub", 0), { pelvis_drop_m: owner.drop, knee: "r" })
    const rootY = groundFootwear(buildBody(look, skeleton, null).footwear).rootY
    const from: NativeGroundPose = { skeleton, rootY, body: [1.15, 4.25] },
      to: NativeGroundPose = { ...from, body: [1.15, 4.75] }
    expect(getNativePlantedContactError({ look, from, to: from, heading: Math.PI / 2, knee: "r" })).toBeNull()
    const a = getNativeGroundContacts({ look, pose: from, heading: Math.PI / 2, knee: "r" }),
      b = getNativeGroundContacts({ look, pose: to, heading: Math.PI / 2, knee: "r" })
    if (a instanceof Error || b instanceof Error) throw new Error("Missing actual ground contacts")
    expect(a.map((contact) => contact.id)).toEqual(["shoe_l", "shoe_r", "knee_r"])
    expect([...a, ...b].every((contact) => Math.abs(contact.point[1]) < 1e-9)).toBe(true)
    for (const index of a.keys()) expect(b[index].point[2] - a[index].point[2]).toBeCloseTo(0.5, 12)
    expect(getNativePlantedContactError({ look, from, to, heading: Math.PI / 2, knee: "r" })?.message).toContain("slides")
    expect(getNativeGroundContacts({ look, pose: { ...from, rootY: rootY + 0.01 }, heading: Math.PI / 2, knee: "r" })).toBeInstanceOf(Error)
    expect(getNativeGroundContacts({ look, pose: from, heading: NaN, knee: "r" })).toBeInstanceOf(Error)
  }
})

it("rejects a shoe pivot even when every previous lowest contact stays fixed", () => {
  for (const owner of [
    { name: "ヴィルヘルム", drop: 0.015 },
    { name: "ゾフィー", drop: 0.02 },
  ]) {
    const look = RESIDENT_LOOKS[RESIDENTS.findIndex((resident) => resident.name === owner.name)],
      skeleton = kneelingPose(look, skelFor(look, "scrub", 0), { pelvis_drop_m: owner.drop, knee: "r" })
    const shoes = buildBody(look, skeleton, null).footwear,
      rootY = groundFootwear(shoes).rootY
    const from: NativeGroundPose = { skeleton, rootY, body: [1.1, 4.25] }
    for (const side of ["l", "r"] satisfies ("l" | "r")[]) {
      const foot = skeleton.p[`foot_${side}`],
        ball = skeleton.p[`ball_${side}`],
        shoe = shoes[side]
      const pivot = shoe.a[1] <= shoe.b[1] ? shoe.a : shoe.b
      const pivotedFoot: [number, number, number] = [pivot[0] + foot[2] - pivot[2], foot[1], pivot[2] - foot[0] + pivot[0]]
      const pivotedBall: [number, number, number] = [pivot[0] + ball[2] - pivot[2], ball[1], pivot[2] - ball[0] + pivot[0]]
      const to = { ...from, skeleton: { ...skeleton, p: { ...skeleton.p, [`foot_${side}`]: pivotedFoot, [`ball_${side}`]: pivotedBall } } }
      const before = getNativeGroundContacts({ look, pose: from, heading: Math.PI / 2, knee: "r" }),
        after = getNativeGroundContacts({ look, pose: to, heading: Math.PI / 2, knee: "r" })
      if (before instanceof Error || after instanceof Error) throw new Error("Missing pivot fixture contacts")
      for (const index of before.keys()) for (const axis of [0, 1, 2]) expect(after[index].point[axis]).toBeCloseTo(before[index].point[axis], 12)
      expect(getNativePlantedContactError({ look, from, to, heading: Math.PI / 2, knee: "r" })).toEqual(new Error("Native planted footwear pivots or slides"))
    }
  }
})
