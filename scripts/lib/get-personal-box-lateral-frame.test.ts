import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { personalStorageSchema } from "#/scripts/lib/personal-storage-schema"
import { getPersonalBoxLateralFrame } from "#/scripts/lib/get-personal-box-lateral-frame"
import { getPersonalBoxLateralReviewError } from "#/scripts/lib/get-personal-box-lateral-review-error"
import { getPersonalBoxLateralSupportError } from "#/scripts/lib/get-personal-box-lateral-support-error"
import { getPersonalBoxGripFrame } from "#/scripts/lib/get-personal-box-grip-frame"

function fixture(number: number) {
  const room = readSetting(readFileSync(`.docs/settings/rooms/room-h1-${number}.md`, "utf8")),
    building = readSetting(readFileSync(".docs/settings/buildings/building-h1.md", "utf8"))
  return { room, building, slot: personalStorageSchema.parse(room.personal_storage)[0] }
}

it("checks both source owners against actual fixed furniture, moving boards, palms, self and planted footwear", () => {
  for (const number of [3, 4]) {
    const source = fixture(number),
      before = JSON.stringify(source)
    expect(getPersonalBoxLateralReviewError(source)).toBeNull()
    expect(JSON.stringify(source)).toBe(before)
    const start = getPersonalBoxLateralFrame({ ...source, cycle: 0, phase: 0 }),
      end = getPersonalBoxLateralFrame({ ...source, cycle: 4, phase: 1 })
    expect(start).toEqual(getPersonalBoxGripFrame({ ...source, state: 1 }))
    expect(end).toEqual(getPersonalBoxGripFrame({ ...source, state: 2 }))
    for (const cycle of [0, 1, 2, 3]) {
      const before = getPersonalBoxLateralFrame({ ...source, cycle, phase: 1 }),
        after = getPersonalBoxLateralFrame({ ...source, cycle: cycle + 1, phase: 0 })
      expect(after).toEqual(before)
    }
    const frame = getPersonalBoxLateralFrame({ ...source, cycle: 0, phase: 0.25 })
    if (frame instanceof Error) throw frame
    expect(getPersonalBoxLateralSupportError({ ...source, cycle: 0, phase: 0.25, frame: { ...frame, body: [frame.body[0] + 0.01, frame.body[1]] } })).toBeInstanceOf(Error)
  }
})

it("keeps the below-floor candidate rejected and refuses invalid or overreaching steps", () => {
  for (const number of [3, 4]) {
    const source = fixture(number),
      review = source.slot.packing?.opening?.reach_review?.grip_review?.motion_review?.lateral_review
    if (!review) throw new Error("Missing source lateral review")
    review.pelvis_rise_m = 1e-10
    expect(getPersonalBoxLateralReviewError(source)).toEqual(new Error("Native low-step knee enters the floor"))
    review.pelvis_rise_m = 0.01
    for (const cycle of [-1, 5, 0.5, NaN]) expect(getPersonalBoxLateralFrame({ ...source, cycle, phase: 0.5 })).toBeInstanceOf(Error)
    for (const phase of [-1, 2, NaN]) expect(getPersonalBoxLateralFrame({ ...source, cycle: 0, phase })).toBeInstanceOf(Error)
    for (const cycles of [0, 17, 1.5, Infinity]) {
      review.cycles = cycles
      expect(getPersonalBoxLateralReviewError(source)).toBeInstanceOf(Error)
    }
  }
})
