import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { getWaterPickupProposal } from "#/scripts/lib/get-water-pickup-proposal"
import { getWaterBackstepProposal } from "#/scripts/lib/get-water-backstep-proposal"
import { getWaterBackstepFrame } from "#/scripts/lib/get-water-backstep-frame"
import { getWaterBackstepReviewError } from "#/scripts/lib/get-water-backstep-review-error"
import { getHeldWaterVesselPose } from "#/world/scene/figure/get-held-water-vessel-pose"
import { buildBody } from "#/world/scene/figure/body"
import { skelFor } from "#/world/scene/figure/helpers/animation/skel-for"
import { toHeadingWorldPoint } from "#/world/scene/to-heading-world-point"
import { lowerNativePose } from "#/world/scene/figure/lower-native-pose"
import { subtractVector3 as sub } from "../../lib/engine/subtract-vector3"
import type { SettingDocument } from "#/scripts/lib/setting-document"
const fixture = () => {
  const room = readSetting(readFileSync(new URL("../../.docs/settings/rooms/room-h1-2.md", import.meta.url), "utf8")),
    documents = new Map<string, SettingDocument>()
  for (const name of ["ゾフィー", "ゴットフリート", "ハインリヒ"]) {
    const resident = readSetting(readFileSync(new URL(`../../.docs/settings/residents/resident-${name}.md`, import.meta.url), "utf8"))
    documents.set(resident.id, resident)
  }
  const proposal = getWaterPickupProposal({ room, documents })
  if (!proposal || proposal instanceof Error) throw proposal
  const withdrawal = getWaterBackstepProposal({ room, proposal })
  if (!withdrawal || withdrawal instanceof Error) throw withdrawal
  return { room, proposal, withdrawal }
}
it("keeps a complete shoe planted through each half-step and preserves every native leg length", () => {
  const f = fixture(),
    native = skelFor(f.proposal.look, "idle", 0)
  for (const cycle of Array.from({ length: f.withdrawal.step.cycles }).keys()) {
    const start = getWaterBackstepFrame({ withdrawal: f.withdrawal, cycle, phase: 0 }),
      middle = getWaterBackstepFrame({ withdrawal: f.withdrawal, cycle, phase: 0.5 })
    if (start instanceof Error) throw start
    if (middle instanceof Error) throw middle
    for (const phase of Array.from({ length: 101 }, (_, index) => index / 100)) {
      const frame = getWaterBackstepFrame({ withdrawal: f.withdrawal, cycle, phase })
      if (frame instanceof Error) throw frame
      const body = buildBody(f.proposal.look, frame.posed.skeleton, null),
        reference = phase <= 0.5 ? start : middle,
        hand = phase <= 0.5 ? "r" : "l",
        shoe = body.footwear[hand],
        referenceShoe = buildBody(f.proposal.look, reference.posed.skeleton, null).footwear[hand]
      for (const end of ["a", "b"] satisfies ("a" | "b")[]) {
        const actual = toHeadingWorldPoint(shoe[end], [frame.body[0], frame.posed.rootY, frame.body[1]], f.proposal.heading),
          expected = toHeadingWorldPoint(referenceShoe[end], [reference.body[0], reference.posed.rootY, reference.body[1]], f.proposal.heading)
        for (const axis of [0, 1, 2]) expect(actual[axis]).toBeCloseTo(expected[axis], 12)
      }
      expect(Math.min(shoe.a[1], shoe.b[1]) - shoe.r + frame.posed.rootY).toBeCloseTo(0, 12)
      expect(frame.posed.rootY).toBeCloseTo(start.posed.rootY, 12)
      for (const side of ["l", "r"] satisfies ("l" | "r")[]) {
        const joints = frame.posed.skeleton.p,
          rest = native.rest
        expect(Math.hypot(...sub(joints[`calf_${side}`], joints[`thigh_${side}`]))).toBeCloseTo(Math.hypot(...sub(rest[`calf_${side}`], rest[`thigh_${side}`])), 12)
        expect(Math.hypot(...sub(joints[`foot_${side}`], joints[`calf_${side}`]))).toBeCloseTo(Math.hypot(...sub(rest[`foot_${side}`], rest[`calf_${side}`])), 12)
        const orientation = sub(joints[`ball_${side}`], joints[`foot_${side}`]),
          referenceOrientation = sub(native.p[`ball_${side}`], native.p[`foot_${side}`])
        for (const axis of [0, 1, 2]) expect(orientation[axis]).toBeCloseTo(referenceOrientation[axis], 12)
      }
      const base = frame.posed.parts.find((part) => part.kind === "cone" && part.part === "base")
      if (!base || base.kind !== "cone") throw new Error("Missing carried jar")
      expect(base.from[1] + frame.posed.rootY).toBeCloseTo(f.withdrawal.position[1], 12)
    }
  }
})
it("joins the raised jar exactly and settles once across all cycle boundaries", () => {
  const f = fixture(),
    native = skelFor(f.proposal.look, "idle", 0),
    initial = getHeldWaterVesselPose({ look: f.proposal.look, skeleton: native, parts: f.proposal.support.definition.parts, position: f.withdrawal.position, scale: 1, poles: f.proposal.grip.poles }),
    start = getWaterBackstepFrame({ withdrawal: f.withdrawal, cycle: 0, phase: 0 })
  if (initial instanceof Error) throw initial
  if (start instanceof Error) throw start
  expect(start.posed.skeleton).toEqual(initial.skeleton)
  expect(start.body).toEqual(f.proposal.review.body_m)
  for (const cycle of Array.from({ length: f.withdrawal.step.cycles - 1 }).keys()) {
    const end = getWaterBackstepFrame({ withdrawal: f.withdrawal, cycle, phase: 1 }),
      next = getWaterBackstepFrame({ withdrawal: f.withdrawal, cycle: cycle + 1, phase: 0 })
    if (end instanceof Error) throw end
    if (next instanceof Error) throw next
    expect(next.posed.skeleton).toEqual(end.posed.skeleton)
    expect(next.body).toEqual(end.body)
  }
  const end = getWaterBackstepFrame({ withdrawal: f.withdrawal, cycle: f.withdrawal.step.cycles - 1, phase: 1 })
  if (end instanceof Error) throw end
  expect(end.body).toEqual(f.withdrawal.step.destination_body_m)
  expect(end.posed.skeleton.p.pelvis[1]).toBe(native.p.pelvis[1] - f.withdrawal.step.settling_drop_m)
  expect(lowerNativePose({ skeleton: native, drop: 0 })).toBe(native)
  for (const drop of [-1, NaN, Infinity]) expect(lowerNativePose({ skeleton: native, drop })).toBeInstanceOf(Error)
})
it("checks every sampled body, jar and foot against the actual shelf and other furniture", () => {
  const f = fixture()
  expect(getWaterBackstepReviewError(f)).toBeNull()
  const proposal: typeof f.proposal = { ...f.proposal, review: { ...f.proposal.review, backstep: { ...f.withdrawal.step, leading_foot: "r" satisfies "r" } } }
  expect(getWaterBackstepReviewError({ ...f, proposal })?.message).toContain("initially planted support foot")
  const tooFar = { ...f.withdrawal, stride: 2 }
  expect(getWaterBackstepFrame({ withdrawal: tooFar, cycle: 0, phase: 0.5 })).toEqual(new Error("Native foot target is unreachable without stretching the leg"))
  for (const phase of [-1, 2, NaN]) expect(getWaterBackstepFrame({ withdrawal: f.withdrawal, cycle: 0, phase })).toBeInstanceOf(Error)
  expect(getWaterBackstepFrame({ withdrawal: f.withdrawal, cycle: f.withdrawal.step.cycles, phase: 0 })).toBeInstanceOf(Error)
})
it("rejects forward or diagonal withdrawal, missing lift and an endpoint outside the operating floor", () => {
  const f = fixture()
  for (const destination of [
    [0.9, 3.25],
    [1.32, 3.3],
  ] satisfies [number, number][]) {
    const proposal: typeof f.proposal = { ...f.proposal, review: { ...f.proposal.review, backstep: { ...f.withdrawal.step, destination_body_m: destination } } }
    expect(getWaterBackstepProposal({ ...f, proposal })).toEqual(new Error("Water withdrawal needs a straight backward path"))
  }
  for (const cycles of [0, 1.5, 17, Infinity]) {
    const proposal: typeof f.proposal = { ...f.proposal, review: { ...f.proposal.review, backstep: { ...f.withdrawal.step, cycles } } }
    expect(getWaterBackstepReviewError({ ...f, proposal })).toEqual(new Error("Invalid water backward step cycles"))
  }
  const outside = { ...f.proposal, review: { ...f.proposal.review, backstep: { ...f.withdrawal.step, destination_body_m: [2.1, 3.25] satisfies [number, number] } } }
  expect(getWaterBackstepProposal({ ...f, proposal: outside })).toEqual(new Error("Water pickup body has no assigned operating place"))
  expect(getWaterBackstepProposal({ ...f, proposal: { ...f.proposal, review: { ...f.proposal.review, lift: undefined } } })).toEqual(new Error("Water backward step has no supported lift endpoint"))
})
