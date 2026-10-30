import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { getWaterPickupProposal } from "#/scripts/lib/get-water-pickup-proposal"
import { getWaterLiftIntervalError } from "#/scripts/lib/get-water-lift-interval-error"
import { getWaterLiftReviewError } from "#/scripts/lib/get-water-lift-review-error"
import { certifyLinearInterval } from "#/lib/engine/certify-linear-interval"
import { getWaterMotionInterval } from "#/world/scene/figure/get-water-motion-interval"
import { getWaterMotionGripError } from "#/world/scene/figure/get-water-motion-grip-error"
import { getWaterVesselSupportMotionError } from "#/world/scene/figure/get-water-vessel-support-motion-error"
import { getArmGripMotionBound } from "#/world/scene/figure/get-arm-grip-motion-bound"
import { solveArmGripPose } from "#/world/scene/figure/solve-arm-grip-pose"
import { nativeArmSurfaces } from "#/world/scene/figure/native-arm-surfaces"
import { skelFor } from "#/world/scene/figure/helpers/animation/skel-for"
import { subtractVector3 as sub } from "../../lib/engine/subtract-vector3"
import { normalizeVector3 as norm } from "../../lib/engine/normalize-vector3"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { WaterSupportPart } from "#/world/town/get-water-vessel-support-parts"
import type { Point3 } from "../../lib/engine/cuboid-motion-types"
const fixture = () => {
  const room = readSetting(readFileSync(new URL("../../.docs/settings/rooms/room-h1-2.md", import.meta.url), "utf8")),
    documents = new Map<string, SettingDocument>()
  for (const name of ["ゾフィー", "ゴットフリート", "ハインリヒ"]) {
    const resident = readSetting(readFileSync(new URL(`../../.docs/settings/residents/resident-${name}.md`, import.meta.url), "utf8"))
    documents.set(resident.id, resident)
  }
  const proposal = getWaterPickupProposal({ room, documents })
  if (!proposal || proposal instanceof Error) throw proposal
  const lift = proposal.review.lift
  if (!lift) throw new Error("Missing lift proposal")
  const from = proposal.position,
    to: Point3 = [from[0], from[1] + lift.rise_m, from[2]],
    skeleton = skelFor(proposal.look, "idle", 0)
  return { room, proposal, skeleton, from, to, lift }
}
it("subdivides an unresolved whole lift into a gap-free continuous proof", () => {
  const f = fixture()
  expect(getWaterLiftIntervalError(f)).toEqual(new Error("Moving water handle cuff clearance remains unresolved"))
  const certified = certifyLinearInterval({ from: f.from, to: f.to, canClear: (from, to) => getWaterLiftIntervalError({ ...f, from, to }) === null })
  if (certified instanceof Error) throw certified
  expect(certified.intervals.length).toBeGreaterThan(1)
  expect(certified.intervals[0].from).toEqual(f.from)
  expect(certified.intervals.at(-1)?.to).toEqual(f.to)
  for (const pair of certified.intervals.entries()) if (pair[0] > 0) expect(pair[1].from).toEqual(certified.intervals[pair[0] - 1].to)
})
it("certifies all authored fixed native frames, but refuses a lift through the cuff", () => {
  const f = fixture()
  expect(getWaterLiftReviewError(f)).toBeNull()
  const proposal = { ...f.proposal, review: { ...f.proposal.review, lift: { ...f.lift, rise_m: 0.08 } } }
  expect(getWaterLiftReviewError({ ...f, proposal })).toBeInstanceOf(Error)
})
it("detects support intersections between free endpoints while allowing initial top contact", () => {
  const f = fixture(),
    interval = getWaterMotionInterval({ look: f.proposal.look, skeleton: f.skeleton, parts: f.proposal.support.definition.parts, from: f.from, to: f.to, scale: 1, poles: f.proposal.grip.poles })
  if (interval instanceof Error) throw interval
  const props = {
    body: f.proposal.review.body_m,
    heading: f.proposal.heading,
    parts: f.proposal.support.parts,
    vessel: f.proposal.support.definition.parts,
    rootY: interval.posed.rootY,
    from: f.from,
    to: f.to,
  }
  expect(getWaterVesselSupportMotionError(props)).toBeNull()
  expect(getWaterVesselSupportMotionError({ ...props, to: [f.from[0], f.from[1] - 0.01, f.from[2]] })).toEqual(new Error("Moving water vessel enters its support"))
  const blocked = {
    ...props,
    parts: [{ part: "top", min: [0.5, 1.4, 3] satisfies Point3, max: [0.89, 1.45, 3.5] satisfies Point3 }] satisfies readonly WaterSupportPart[],
    to: [f.from[0], 2, f.from[2]] satisfies Point3,
  }
  expect(getWaterVesselSupportMotionError({ ...blocked, to: blocked.from })).toBeNull()
  expect(getWaterVesselSupportMotionError({ ...blocked, from: blocked.to })).toBeNull()
  expect(getWaterVesselSupportMotionError(blocked)).toEqual(new Error("Moving water vessel enters its support"))
  expect(getWaterVesselSupportMotionError({ ...props, to: [NaN, 1, 0] })).toBeInstanceOf(Error)
})
it("bounds the actual wrist, forearm direction and every native arm control point", () => {
  const f = fixture(),
    interval = getWaterMotionInterval({ look: f.proposal.look, skeleton: f.skeleton, parts: f.proposal.support.definition.parts, from: f.from, to: f.to, scale: 1, poles: f.proposal.grip.poles })
  if (interval instanceof Error) throw interval
  for (const hand of ["l", "r"] satisfies ("l" | "r")[]) {
    const bar = interval.posed.parts.find((part) => part.kind === "capsule" && part.section === "grip" && part.side === hand)
    if (!bar || bar.kind !== "capsule") throw new Error("Missing moving grip")
    const centre = bar.from.map((value, axis) => (value + bar.to[axis]) / 2),
      rise = f.to[1] - f.from[1]
    const from: Point3 = [centre[0], centre[1] - rise / 2, centre[2]],
      to: Point3 = [centre[0], centre[1] + rise / 2, centre[2]],
      bound = getArmGripMotionBound({ look: f.proposal.look, skeleton: f.skeleton, hand, from, to, pole: f.proposal.grip.poles[hand] })
    if (bound instanceof Error) throw bound
    const poses = Array.from({ length: 65 }, (_, index) => {
      const posed = solveArmGripPose({ skeleton: f.skeleton, hand, target: [from[0], from[1] + (rise * index) / 64, from[2]], pole: f.proposal.grip.poles[hand] })
      if (posed instanceof Error) throw posed
      const joints = posed.skeleton.p,
        elbow = joints[`lowerarm_${hand}`],
        wrist = joints[`hand_${hand}`],
        shape = nativeArmSurfaces({ scale: bound.scale, shoulder: joints[`upperarm_${hand}`], elbow: elbow, wrist: wrist })
      return { wrist, direction: norm(sub(wrist, elbow)), points: [...shape.arm.capsuleBounds(), ...shape.uncutCuff.capsuleBounds()].flatMap((capsule) => [capsule.a, capsule.b]) }
    })
    for (const pair of poses.entries()) {
      if (pair[0] === 0) continue
      const previous = poses[pair[0] - 1]
      expect(Math.hypot(...sub(pair[1].wrist, previous.wrist))).toBeLessThanOrEqual(bound.wrist / 64)
      expect(Math.hypot(...sub(pair[1].direction, previous.direction))).toBeLessThanOrEqual(bound.direction / 64)
      for (const point of pair[1].points.entries()) expect(Math.hypot(...sub(point[1], previous.points[point[0]]))).toBeLessThanOrEqual(bound.surface / 64)
    }
    expect(getArmGripMotionBound({ look: f.proposal.look, skeleton: f.skeleton, hand, from: [NaN, 0, 0], to, pole: f.proposal.grip.poles[hand] })).toBeInstanceOf(Error)
    const shoulder = f.skeleton.p[`upperarm_${hand}`]
    expect(getArmGripMotionBound({ look: f.proposal.look, skeleton: f.skeleton, hand, from: shoulder, to: shoulder, pole: f.proposal.grip.poles[hand] })).toEqual(
      new Error("Arm grip target coincides with its shoulder"),
    )
  }
  expect(getWaterMotionGripError({ ...interval, motion: { ...interval.motion, l: { ...interval.motion.l, wrist: NaN } } })).toBeInstanceOf(Error)
})
