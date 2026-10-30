import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { personalStorageSchema } from "#/scripts/lib/personal-storage-schema"
import { getPersonalBoxGripFrame } from "#/scripts/lib/get-personal-box-grip-frame"
import { getPersonalBoxGripClearanceError } from "#/scripts/lib/get-personal-box-grip-clearance-error"
import { getPersonalBoxHandlingError } from "#/scripts/lib/get-personal-box-handling-error"
import { getStorageLidBridge } from "#/world/town/get-storage-lid-bridge"
import { getRoundBarContactError } from "#/world/scene/figure/get-round-bar-contact-error"
import { armGripLengths } from "#/world/scene/figure/arm-grip-lengths"
import { armGripPoint } from "#/world/scene/figure/arm-grip-point"
import { toHeadingLocalPoint } from "#/world/scene/to-heading-local-point"
import { getCertifiedBarBodyError } from "#/world/scene/figure/get-certified-bar-body-error"
import { buildBody } from "#/world/scene/figure/body"
import { createBodyContext } from "#/world/scene/figure/context"
import type { Skel } from "#/world/scene/rig"
import { getForearmPairSelfClearanceError } from "#/world/scene/figure/get-forearm-pair-self-clearance-error"
const distance = (first: readonly number[], second: readonly number[]) => Math.hypot(...first.map((value, index) => value - second[index]))

function fixture(number = 3) {
  const room = readSetting(readFileSync(`.docs/settings/rooms/room-h1-${number}.md`, "utf8")),
    building = readSetting(readFileSync(".docs/settings/buildings/building-h1.md", "utf8"))
  const slot = personalStorageSchema.parse(room.personal_storage)[0]
  return { room, building, slot }
}

it("encloses the complete wooden bridge in native palms at every source endpoint with fixed and moving solids clear", () => {
  for (const number of [3, 4]) {
    const source = fixture(number),
      before = JSON.stringify(source)
    expect(getPersonalBoxHandlingError(source)).toBeNull()
    for (const state of [0, 1, 2, 3]) {
      const frame = getPersonalBoxGripFrame({ ...source, state })
      if (frame instanceof Error) throw frame
      for (const hand of ["l", "r"] satisfies ("l" | "r")[]) {
        expect(getRoundBarContactError({ skeleton: frame.posed.skeleton, hand, bar: frame.bar })).toBeNull()
        const lengths = armGripLengths(frame.skeleton, hand),
          shoulder = frame.posed.skeleton.p[`upperarm_${hand}`],
          elbow = frame.posed.skeleton.p[`lowerarm_${hand}`],
          wrist = frame.posed.skeleton.p[`hand_${hand}`]
        expect(distance(shoulder, elbow)).toBeCloseTo(lengths.upper, 12)
        expect(distance(elbow, wrist)).toBeCloseTo(lengths.forearm, 12)
        expect(distance(armGripPoint(elbow, wrist), frame.posed.grips[hand])).toBeLessThan(1e-12)
      }
      expect(getPersonalBoxGripClearanceError({ ...source, frame })).toBeNull()
      expect(getForearmPairSelfClearanceError({ look: frame.look, skeleton: frame.posed.skeleton, margins: { l: 0, r: 0 } })).toBeNull()
      expect(frame.posed.skeleton.rest).toEqual(frame.skeleton.rest)
      expect(frame.posed.skeleton.p.pelvis).toEqual(frame.skeleton.p.pelvis)
    }
    expect(JSON.stringify(source)).toBe(before)
  }
})

it("retains the original raised elbows and narrow palms as an unresolved self-clearance candidate", () => {
  for (const number of [3, 4]) {
    const source = fixture(number),
      reach = source.slot.packing?.opening?.reach_review,
      handle = source.slot.packing?.lid_handle
    if (!reach?.grip_review || !handle) throw new Error("Missing old candidate data")
    reach.body_from_lid_m = [-0.85, 0]
    reach.hand_half_span_m = 0.05
    reach.grip_review.elbow_poles = { l: [1, 1, -1], r: [-1, 1, -1] }
    handle.span_m = 0.28
    const frame = getPersonalBoxGripFrame({ ...source, state: 0 })
    if (frame instanceof Error) throw frame
    expect(getForearmPairSelfClearanceError({ look: frame.look, skeleton: frame.posed.skeleton, margins: { l: 0, r: 0 } })).toBeInstanceOf(Error)
  }
})

it("uses a whole-cross-section capsule containing every rendered bridge corner", () => {
  const source = fixture(),
    frame = getPersonalBoxGripFrame({ ...source, state: 1 })
  if (frame instanceof Error) throw frame
  const bridge = getStorageLidBridge(frame.parts)
  if (!bridge) throw new Error("Missing actual bridge")
  for (const x of [bridge.x0, bridge.x1])
    for (const y of [bridge.y0, bridge.y1])
      for (const z of [bridge.z0, bridge.z1]) {
        const point = toHeadingLocalPoint([x, y, z], [frame.body[0], frame.posed.rootY, frame.body[1]], Math.PI / 2)
        const nearest = [Math.max(frame.bar.from[0], Math.min(frame.bar.to[0], point[0])), frame.bar.from[1], frame.bar.from[2]]
        expect(distance(point, nearest)).toBeLessThanOrEqual(frame.bar.radius * (1 + 1e-12))
      }
})

it("retains high-lift head interference and rejects missing contact profiles instead of exempting arms", () => {
  const source = fixture(),
    opening = source.slot.packing?.opening
  if (!opening) throw new Error("Missing opening")
  opening.lift_m = 0.15
  const legacy = opening.reach_review,
    handle = source.slot.packing?.lid_handle
  if (!legacy?.grip_review || !handle) throw new Error("Missing legacy candidate fields")
  legacy.body_from_lid_m = [-0.85, 0]
  legacy.hand_half_span_m = 0.05
  legacy.grip_review.elbow_poles = { l: [1, 1, -1], r: [-1, 1, -1] }
  handle.span_m = 0.28
  const high = getPersonalBoxGripFrame({ ...source, state: 1 })
  if (high instanceof Error) throw high
  expect(getPersonalBoxGripClearanceError({ ...source, frame: high })).toBeInstanceOf(Error)
  const valid = fixture(4),
    frame = getPersonalBoxGripFrame({ ...valid, state: 0 })
  if (frame instanceof Error) throw frame
  const missing: Skel = { ...frame.posed.skeleton, handGrips: {} }
  expect(getCertifiedBarBodyError({ body: buildBody(frame.look, missing, null), skeleton: missing, bodyScale: createBodyContext(frame.look, missing, null).S, bar: frame.bar })).toBeInstanceOf(Error)
})

it("still checks upper arms even when both palm and cuff certificates are valid", () => {
  const source = fixture(4),
    frame = getPersonalBoxGripFrame({ ...source, state: 0 })
  if (frame instanceof Error) throw frame
  const skeleton: Skel = { ...frame.posed.skeleton, p: { ...frame.posed.skeleton.p, upperarm_l: [...frame.bar.from] } }
  expect(getRoundBarContactError({ skeleton, hand: "l", bar: frame.bar })).toBeNull()
  expect(getRoundBarContactError({ skeleton, hand: "r", bar: frame.bar })).toBeNull()
  const error = getCertifiedBarBodyError({ body: buildBody(frame.look, skeleton, null), skeleton, bodyScale: createBodyContext(frame.look, skeleton, null).S, bar: frame.bar })
  expect(error?.message).toContain("upper-arm")
})
