import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { tablePlaceSettingsSchema } from "#/scripts/lib/table-place-settings-schema"
import { getDiningSeatGeometry } from "#/scripts/lib/get-dining-seat-geometry"
import { getSeatedNativePose } from "#/world/scene/get-seated-native-pose"
import { getSeatedRestError } from "#/world/scene/get-seated-rest-error"
import { armGripLengths } from "#/world/scene/figure/arm-grip-lengths"
import { armGripPoint } from "#/world/scene/figure/arm-grip-point"
import { toHeadingWorldPoint } from "#/world/scene/to-heading-world-point"
import { BONE_ORDER } from "#/world/scene/rig"
import { RESIDENTS, RESIDENT_LOOKS } from "#/world/town/residents"
const fixture = () => {
  const room = readSetting(readFileSync(new URL("../../.docs/settings/rooms/room-h1-1.md", import.meta.url), "utf8"))
  const plan = tablePlaceSettingsSchema.parse(room.meal_place_settings)
  return plan.places.map((place) => {
    const chair = room.furniture?.find((furniture) => furniture.symbol === place.chair),
      table = room.furniture?.find((furniture) => furniture.symbol === plan.table)
    if (!chair || !table || !room.grid || !place.reach_review?.rest) throw new Error("Missing authored resting hands")
    const geometry = getDiningSeatGeometry({ chair, table, cell: room.grid.cell_m })
    if (geometry instanceof Error) throw geometry
    const look = RESIDENT_LOOKS[RESIDENTS.findIndex((resident) => `resident-${resident.name}` === place.resident)]
    return { look, place: geometry.place, rest: place.reach_review.rest }
  })
}

it("keeps native support and both bone lengths while clearing the authored resting forearms in every frame", () => {
  for (const props of fixture()) {
    expect(getSeatedRestError({ ...props, obstacles: [] })).toBeNull()
    for (const frame of Array.from({ length: 17 }).keys()) {
      const raw = getSeatedNativePose({ look: props.look, place: props.place, frame }),
        resting = getSeatedNativePose({ ...props, frame })
      if (raw instanceof Error) throw raw
      if (resting instanceof Error) throw resting
      expect(resting.root).toEqual(raw.root)
      expect(resting.skeleton.q).toEqual(raw.skeleton.q)
      expect(resting.skeleton.rest).toEqual(raw.skeleton.rest)
      for (const bone of BONE_ORDER) if (!["lowerarm_l", "lowerarm_r", "hand_l", "hand_r"].includes(bone)) expect(resting.skeleton.p[bone]).toEqual(raw.skeleton.p[bone])
      for (const hand of ["l", "r"] satisfies ("l" | "r")[]) {
        const joints = resting.skeleton.p,
          lengths = armGripLengths(raw.skeleton, hand)
        expect(Math.hypot(...joints[`lowerarm_${hand}`].map((value, axis) => value - joints[`upperarm_${hand}`][axis]))).toBeCloseTo(lengths.upper, 12)
        expect(Math.hypot(...joints[`hand_${hand}`].map((value, axis) => value - joints[`lowerarm_${hand}`][axis]))).toBeCloseTo(lengths.forearm, 12)
        const actual = toHeadingWorldPoint(armGripPoint(joints[`lowerarm_${hand}`], joints[`hand_${hand}`]), resting.root, props.place.heading)
        const target = toHeadingWorldPoint(props.rest[hand].seat_target_m, [props.place.at[0], 0, props.place.at[1]], props.place.heading)
        for (const axis of [0, 1, 2]) expect(actual[axis]).toBeCloseTo(target[axis], 12)
      }
    }
  }
})

it("rejects an unreachable rest, invalid coordinates and overlapping resting hands", () => {
  const props = fixture()[0]
  props.rest.l.seat_target_m = [4, 0.44, 0.02]
  expect(getSeatedRestError({ ...props, obstacles: [] })?.message).toContain("unreachable")
  props.rest.l.seat_target_m = [NaN, 0.44, 0.02]
  expect(getSeatedRestError({ ...props, obstacles: [] })?.message).toContain("Invalid")
  props.rest.l.seat_target_m = [0, 0.64, 0.14]
  props.rest.r.seat_target_m = [0, 0.64, 0.14]
  const overlapping = getSeatedNativePose({ ...props, frame: 0 })
  if (overlapping instanceof Error) throw overlapping
  const joints = overlapping.skeleton.p
  const left = armGripPoint(joints.lowerarm_l, joints.hand_l),
    right = armGripPoint(joints.lowerarm_r, joints.hand_r)
  expect(Math.hypot(...left.map((value, axis) => value - right[axis]))).toBeLessThan(1e-12)
  expect(getSeatedRestError({ ...props, obstacles: [] })?.message).toContain("self-clearance remains unresolved")
})
