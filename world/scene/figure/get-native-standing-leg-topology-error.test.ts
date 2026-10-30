import { expect, it } from "vitest"
import { getNativeStandingLegTopologyError } from "#/world/scene/figure/get-native-standing-leg-topology-error"
import { getNativeGroundedFootPose } from "#/world/scene/figure/get-native-grounded-foot-pose"
import { getEasedSideStepOffsets } from "#/world/town/get-eased-side-step-offsets"
import { RESIDENTS, RESIDENT_LOOKS } from "#/world/town/residents"
import { skelFor } from "#/world/scene/figure/helpers/animation/skel-for"

it("rejects nonfinite knee geometry instead of treating an unordered fold comparison as standing", () => {
  const look = RESIDENT_LOOKS[RESIDENTS.findIndex((resident) => resident.name === "ヴィルヘルム")],
    native = skelFor(look, "idle", 0)
  const offsets = getEasedSideStepOffsets({ stride: 0.1, lift: 0.035, direction: "right", phase: 0 })
  if (offsets instanceof Error) throw offsets
  const pose = getNativeGroundedFootPose({ look, skeleton: native, pelvisDrop: 0.02, offsets })
  if (pose instanceof Error) throw pose
  const skeleton = pose.skeleton,
    props = { look, skeleton, kneeMargins: { l: 0, r: 0 } },
    before = JSON.stringify(skeleton)
  expect(getNativeStandingLegTopologyError(props)).toBeNull()
  for (const height of [NaN, Infinity, -Infinity])
    for (const side of ["l", "r"] satisfies ("l" | "r")[]) {
      const bone = `calf_${side}` satisfies "calf_l" | "calf_r",
        knee = skeleton.p[bone]
      expect(getNativeStandingLegTopologyError({ ...props, skeleton: { ...skeleton, p: { ...skeleton.p, [bone]: [knee[0], height, knee[2]] } } })).toBeInstanceOf(Error)
    }
  expect(JSON.stringify(skeleton)).toBe(before)
})
