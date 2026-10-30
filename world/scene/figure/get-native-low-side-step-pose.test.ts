import { expect, it } from "vitest"
import { RESIDENTS, RESIDENT_LOOKS } from "#/world/town/residents"
import { skelFor } from "#/world/scene/figure/helpers/animation/skel-for"
import { kneelingPose } from "#/world/scene/figure/kneeling"
import { buildBody } from "#/world/scene/figure/body"
import { groundFootwear } from "#/world/scene/figure/footing"
import { getNativeLowSideStepPose } from "#/world/scene/figure/get-native-low-side-step-pose"
import { getNativeLowStepGroundError } from "#/world/scene/figure/get-native-low-step-ground-error"
import { getNativePlantedFootwearError } from "#/world/scene/figure/get-native-planted-footwear-error"

function fixture(name: string, drop: number) {
  const look = RESIDENT_LOOKS[RESIDENTS.findIndex((resident) => resident.name === name)],
    skeleton = kneelingPose(look, skelFor(look, "scrub", 0), { pelvis_drop_m: drop, knee: "r" })
  return { look, skeleton, rootY: groundFootwear(buildBody(look, skeleton, null).footwear).rootY }
}

it("releases the knee without stretching legs or sliding the entire planted shoe", () => {
  for (const source of [fixture("ヴィルヘルム", 0.015), fixture("ゾフィー", 0.02)]) {
    const before = JSON.stringify(source),
      props = { skeleton: source.skeleton, stride: 0.1, lift: 0.04, pelvisRise: 0.01, direction: "right" } satisfies Omit<Parameters<typeof getNativeLowSideStepPose>[0], "phase">
    for (const index of Array.from({ length: 101 }).keys()) {
      const phase = index / 100,
        step = getNativeLowSideStepPose({ ...props, phase }),
        anchor = getNativeLowSideStepPose({ ...props, phase: phase <= 0.5 ? 0 : 0.5 })
      if (step instanceof Error || anchor instanceof Error) throw new Error("Missing native low step")
      expect(getNativeLowStepGroundError({ ...source, skeleton: step.skeleton, offsets: step.offsets })).toBeNull()
      expect(
        getNativePlantedFootwearError({
          look: source.look,
          heading: Math.PI / 2,
          sides: [phase <= 0.5 ? "l" : "r"],
          from: { skeleton: anchor.skeleton, rootY: source.rootY, body: [0, -anchor.offsets.body] },
          to: { skeleton: step.skeleton, rootY: source.rootY, body: [0, -step.offsets.body] },
        }),
      ).toBeNull()
      for (const side of ["l", "r"] satisfies ("l" | "r")[])
        for (const pair of [
          [`thigh_${side}`, `calf_${side}`],
          [`calf_${side}`, `foot_${side}`],
        ] satisfies (readonly [`thigh_${"l" | "r"}` | `calf_${"l" | "r"}`, `calf_${"l" | "r"}` | `foot_${"l" | "r"}`])[]) {
          const actual = step.skeleton.p[pair[0]],
            target = step.skeleton.p[pair[1]],
            rest = source.skeleton.rest
          expect(Math.hypot(...target.map((value, axis) => value - actual[axis]))).toBeCloseTo(Math.hypot(...rest[pair[1]].map((value, axis) => value - rest[pair[0]][axis])), 12)
        }
      if (phase === 0 || phase === 1) expect(step.skeleton).toBe(source.skeleton)
    }
    expect(JSON.stringify(source)).toBe(before)
  }
})

it("rejects the unraised knee-through-floor candidate and unreachable placements", () => {
  for (const source of [fixture("ヴィルヘルム", 0.015), fixture("ゾフィー", 0.02)]) {
    const props = { skeleton: source.skeleton, stride: 0.1, lift: 0.04, pelvisRise: 1e-10, direction: "right", phase: 0.25 } satisfies Parameters<typeof getNativeLowSideStepPose>[0],
      step = getNativeLowSideStepPose(props)
    if (step instanceof Error) throw step
    expect(getNativeLowStepGroundError({ ...source, skeleton: step.skeleton, offsets: step.offsets })).toEqual(new Error("Native low-step knee enters the floor"))
    expect(getNativeLowSideStepPose({ ...props, pelvisRise: 0.01, stride: 2 })).toBeInstanceOf(Error)
    const constrained = {
      ...source.skeleton,
      handGrips: { l: { axis: [1, 0, 0] satisfies [number, number, number], across: [0, 0, 1] satisfies [number, number, number], halfWidth: 0.01, halfDepth: 0.01 } },
    }
    expect(getNativeLowSideStepPose({ ...props, skeleton: constrained, pelvisRise: 0.01 })).toEqual(new Error("Native low step must precede hand contact constraints"))
    for (const pelvisRise of [0, -1, NaN, Infinity]) expect(getNativeLowSideStepPose({ ...props, pelvisRise })).toBeInstanceOf(Error)
  }
})
