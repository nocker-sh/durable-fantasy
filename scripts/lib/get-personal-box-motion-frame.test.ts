import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { personalStorageSchema } from "#/scripts/lib/personal-storage-schema"
import { getPersonalBoxMotionFrame } from "#/scripts/lib/get-personal-box-motion-frame"
import { getPersonalBoxGripFrame } from "#/scripts/lib/get-personal-box-grip-frame"
import { getPersonalBoxVerticalReviewError } from "#/scripts/lib/get-personal-box-vertical-review-error"

function fixture(number = 3) {
  const room = readSetting(readFileSync(`.docs/settings/rooms/room-h1-${number}.md`, "utf8")),
    building = readSetting(readFileSync(".docs/settings/buildings/building-h1.md", "utf8"))
  const slot = personalStorageSchema.parse(room.personal_storage)[0]
  return { room, building, slot }
}

it("keeps source-owner contact and stationary support at every declared vertical sample, exactly joining endpoints", () => {
  for (const number of [3, 4]) {
    const source = fixture(number),
      before = JSON.stringify(source)
    expect(getPersonalBoxVerticalReviewError(source)).toBeNull()
    for (const segment of [0, 2])
      for (const progress of [0, 0.25, 0.5, 0.75, 1]) {
        const frame = getPersonalBoxMotionFrame({ ...source, segment, progress })
        if (frame instanceof Error) throw frame
        if (progress === 0 || progress === 1) {
          const expected = getPersonalBoxGripFrame({ ...source, state: segment + progress })
          if (expected instanceof Error) throw expected
          expect(frame).toEqual(expected)
        }
      }
    expect(JSON.stringify(source)).toBe(before)
  }
})

it("rejects a sliding grounded actor in the lateral phase instead of approving interpolated endpoints", () => {
  for (const number of [3, 4])
    for (const progress of [0.01, 0.25, 0.5, 0.75, 1]) {
      expect(getPersonalBoxMotionFrame({ ...fixture(number), segment: 1, progress })).toEqual(new Error("Native planted support slides; a stepping design is required"))
    }
})

it("rejects invalid progress and sample counts rather than skipping phases", () => {
  for (const progress of [-1, 2, NaN]) expect(getPersonalBoxMotionFrame({ ...fixture(), segment: 0, progress })).toBeInstanceOf(Error)
  const source = fixture(),
    review = source.slot.packing?.opening?.reach_review?.grip_review?.motion_review
  if (!review) throw new Error("Missing motion review")
  for (const count of [0, -1, 0.5, 129, NaN]) {
    review.samples_per_phase = count
    expect(getPersonalBoxVerticalReviewError(source)).toBeInstanceOf(Error)
  }
})
