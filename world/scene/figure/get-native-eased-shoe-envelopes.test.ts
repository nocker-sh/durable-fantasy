import { expect, it } from "vitest"
import { RESIDENTS, RESIDENT_LOOKS } from "#/world/town/residents"
import { skelFor } from "#/world/scene/figure/helpers/animation/skel-for"
import { buildBody } from "#/world/scene/figure/body"
import { createBodyContext } from "#/world/scene/figure/context"
import { buildLegs } from "#/world/scene/figure/legs"
import { getNativeEasedShoeEnvelopes } from "#/world/scene/figure/get-native-eased-shoe-envelopes"
import { getNativeShoeEnvelopeError } from "#/world/scene/figure/get-native-shoe-envelope-error"
import { getNativeGroundedFootPose } from "#/world/scene/figure/get-native-grounded-foot-pose"
import { getNativeStandingLegTopologyError } from "#/world/scene/figure/get-native-standing-leg-topology-error"
import { getNativeLegIntervalExternalError } from "#/world/scene/figure/get-native-leg-interval-external-error"
import { getEasedSideStepOffsets } from "#/world/town/get-eased-side-step-offsets"

it("covers the real shoe capsules at every sampled phase while preserving their floor certificate", () => {
  for (const name of ["ヴィルヘルム", "ゾフィー"]) {
    const look = RESIDENT_LOOKS[RESIDENTS.findIndex((resident) => resident.name === name)],
      native = skelFor(look, "idle", 0),
      stride = 0.11,
      lift = 0.035
    const envelopes = getNativeEasedShoeEnvelopes({ look, native, stride, lift })
    if (envelopes instanceof Error) throw envelopes
    expect(getNativeShoeEnvelopeError({ shoes: envelopes, boxes: [], ceiling: 2 })).toBeNull()
    for (const direction of ["left", "right"] satisfies ("left" | "right")[])
      for (const index of Array.from({ length: 101 }).keys()) {
        const offsets = getEasedSideStepOffsets({ phase: index / 100, stride, lift, direction })
        if (offsets instanceof Error) throw offsets
        const pose = getNativeGroundedFootPose({ look, skeleton: native, pelvisDrop: 0.02, offsets })
        if (pose instanceof Error) throw pose
        const body = buildBody(look, pose.skeleton, null)
        for (const pair of (["l", "r"] satisfies ("l" | "r")[]).entries()) {
          const shoe = body.footwear[pair[1]],
            box = envelopes.boxes[pair[0]]
          for (const point of [shoe.a, shoe.b]) {
            expect(point[0] - shoe.r).toBeGreaterThanOrEqual(box.x0)
            expect(point[0] + shoe.r).toBeLessThanOrEqual(box.x1)
            expect(point[1] - shoe.r).toBeGreaterThanOrEqual(box.bottom)
            expect(point[1] + shoe.r).toBeLessThanOrEqual(box.top)
            expect(point[2] - shoe.r).toBeGreaterThanOrEqual(box.z0)
            expect(point[2] + shoe.r).toBeLessThanOrEqual(box.z1)
          }
        }
      }
  }
})

it("exposes every rendered leg primitive exactly once and refuses an unbounded standing recipe", () => {
  const look = RESIDENT_LOOKS[RESIDENTS.findIndex((resident) => resident.name === "ゾフィー")],
    native = skelFor(look, "idle", 0),
    body = buildBody(look, native, null)
  const parts = [...body.legParts.l, ...body.legParts.r]
  expect(new Set(parts).size).toBe(parts.length)
  for (const pair of parts.entries()) expect(pair[1]).toBe(body.prims[pair[0]])
  for (const side of ["l", "r"] satisfies ("l" | "r")[]) expect(body.legParts[side][body.legParts[side].length - 1]).toBe(body.shoeParts[side])
  expect(getNativeStandingLegTopologyError({ look, skeleton: native, kneeMargins: { l: 0, r: 0 } })).toBeNull()
  expect(getNativeStandingLegTopologyError({ look, skeleton: native, kneeMargins: { l: 1, r: 1 } })).toBeInstanceOf(Error)
  const legs = buildLegs(createBodyContext(look, native, null))
  expect(getNativeLegIntervalExternalError({ legs: { ...legs, parts: { l: [], r: [] } }, margins: { l: 0, r: 0 }, boxes: [], rootY: 0.1, ceiling: 2 })).toBeInstanceOf(Error)
})

it("refuses invalid whole-cycle shoe bounds instead of skipping empty or non-finite geometry", () => {
  const look = RESIDENT_LOOKS[RESIDENTS.findIndex((resident) => resident.name === "ゾフィー")],
    native = skelFor(look, "idle", 0),
    shoes = getNativeEasedShoeEnvelopes({ look, native, stride: 0.1, lift: 0.03 })
  if (shoes instanceof Error) throw shoes
  expect(getNativeShoeEnvelopeError({ shoes: { ...shoes, boxes: [] }, boxes: [], ceiling: 2 })).toBeInstanceOf(Error)
  expect(getNativeShoeEnvelopeError({ shoes, boxes: [], ceiling: 0.1 })).toBeInstanceOf(Error)
  expect(getNativeEasedShoeEnvelopes({ look, native, stride: NaN, lift: 0.03 })).toBeInstanceOf(Error)
})
