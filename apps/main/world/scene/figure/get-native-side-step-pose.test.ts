import { expect, it } from "vitest"
import { getNativeSideStepPose } from "#/world/scene/figure/get-native-side-step-pose"
import { skelFor } from "#/world/scene/figure/helpers/animation/skel-for"
import { groundFootwear } from "#/world/scene/figure/footing"
import { buildBody } from "#/world/scene/figure/body"
import { RESIDENTS, RESIDENT_LOOKS } from "#/world/town/residents"
const look = RESIDENT_LOOKS[RESIDENTS.findIndex((resident) => resident.name === "エーリヒ")]
const base = skelFor(look, "idle", 0),
  feet = groundFootwear(buildBody(look, base, null).footwear)
it.each(Array<"left" | "right">("left", "right"))("keeps native leg lengths and planted shoe contact through a %s step", (direction) => {
  for (const phase of Array.from({ length: 101 }, (_, index) => index / 100)) {
    const pose = getNativeSideStepPose({ look, phase, stride: 0.12, lift: 0.05, pelvisDrop: 0.02, direction })
    if (pose instanceof Error) throw pose
    const actual = groundFootwear(buildBody(look, pose.skeleton, null).footwear)
    expect(actual.rootY).toBeCloseTo(feet.rootY, 12)
    const worldLeft = actual.feet.find((entry) => entry.side === "l")!.lowest[0] + pose.offsets.body
    const worldRight = actual.feet.find((entry) => entry.side === "r")!.lowest[0] + pose.offsets.body
    const baseLeft = feet.feet.find((entry) => entry.side === "l")!.lowest[0],
      baseRight = feet.feet.find((entry) => entry.side === "r")!.lowest[0]
    expect(worldLeft - worldRight).toBeGreaterThanOrEqual(baseLeft - baseRight - 1e-9)
    if (phase <= 0.5) expect(direction === "left" ? worldRight : worldLeft).toBeCloseTo(direction === "left" ? baseRight : baseLeft, 12)
    if (phase >= 0.5) expect(direction === "left" ? worldLeft : worldRight).toBeCloseTo(direction === "left" ? baseLeft + 0.12 : baseRight - 0.12, 12)

    for (const side of Array<"l" | "r">("l", "r")) {
      const hip = pose.skeleton.p[`thigh_${side}`],
        knee = pose.skeleton.p[`calf_${side}`],
        foot = pose.skeleton.p[`foot_${side}`]
      const restHip = base.rest[`thigh_${side}`],
        restKnee = base.rest[`calf_${side}`],
        restFoot = base.rest[`foot_${side}`]
      expect(Math.hypot(...knee.map((value, index) => value - hip[index]))).toBeCloseTo(Math.hypot(...restKnee.map((value, index) => value - restHip[index])), 12)
      expect(Math.hypot(...foot.map((value, index) => value - knee[index]))).toBeCloseTo(Math.hypot(...restFoot.map((value, index) => value - restKnee[index])), 12)
      const contact = actual.feet.find((entry) => entry.side === side)!
      expect(contact.clearance).toBeCloseTo(pose.offsets[side][1], 12)
      expect(contact.lowest[2]).toBeCloseTo(feet.feet.find((entry) => entry.side === side)!.lowest[2], 12)
    }
  }
})
it("rejects overreaching steps rather than stretching a leg", () => {
  expect(getNativeSideStepPose({ look, phase: 0.5, stride: 2, lift: 0.05, pelvisDrop: 0.02, direction: "left" })).toEqual(new Error("Native foot target is unreachable without stretching the leg"))
})
