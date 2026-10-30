import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { personalStorageSchema } from "#/scripts/lib/personal-storage-schema"
import { getPersonalBoxContinuousReview } from "#/scripts/lib/get-personal-box-continuous-review"
import { getPersonalBoxIntervalContext } from "#/scripts/lib/get-personal-box-interval-context"
import { getPersonalBoxIntervalSliceError } from "#/scripts/lib/get-personal-box-interval-slice-error"

function fixture(number = 3) {
  const room = readSetting(readFileSync(`.docs/settings/rooms/room-h1-${number}.md`, "utf8")),
    building = readSetting(readFileSync(".docs/settings/buildings/building-h1.md", "utf8"))
  return { room, building, slot: personalStorageSchema.parse(room.personal_storage)[0] }
}

it("certifies complete gap-free vertical phases for both actual owners without mutating authored settings", () => {
  for (const number of [3, 4])
    for (const segment of [0, 2]) {
      const source = fixture(number),
        before = JSON.stringify(source),
        review = getPersonalBoxContinuousReview({ ...source, segment })
      if (review instanceof Error) throw review
      expect(review.intervals[0].from).toEqual([0, 0, 0])
      expect(review.intervals.at(-1)?.to).toEqual([1, 0, 0])
      const context = getPersonalBoxIntervalContext({ ...source, segment })
      if (context instanceof Error) throw context
      for (const index of review.intervals.keys()) {
        const interval = review.intervals[index]
        expect(interval.to[0]).toBeGreaterThan(interval.from[0])
        if (index) expect(interval.from).toEqual(review.intervals[index - 1].to)
        expect(getPersonalBoxIntervalSliceError({ context, from: interval.from[0], to: interval.to[0] })).toBeNull()
      }
      expect(JSON.stringify(source)).toBe(before)
    }
})

it("rejects the entire high-lift candidate rather than returning its clear prefix", () => {
  const source = fixture(),
    opening = source.slot.packing?.opening
  if (!opening) throw new Error("Missing authored lift")
  opening.lift_m = 0.15
  const legacy = opening.reach_review,
    handle = source.slot.packing?.lid_handle
  if (!legacy?.grip_review || !handle) throw new Error("Missing legacy candidate fields")
  legacy.body_from_lid_m = [-0.85, 0]
  legacy.hand_half_span_m = 0.05
  legacy.grip_review.elbow_poles = { l: [1, 1, -1], r: [-1, 1, -1] }
  handle.span_m = 0.28
  expect(getPersonalBoxContinuousReview({ ...source, segment: 0 })).toBeInstanceOf(Error)
})

it("keeps lateral travel outside the planted vertical model and rejects invalid slices", () => {
  expect(getPersonalBoxContinuousReview({ ...fixture(), segment: 1 })).toBeInstanceOf(Error)
  const context = getPersonalBoxIntervalContext({ ...fixture(4), segment: 2 })
  if (context instanceof Error) throw context
  for (const range of [
    [-0.1, 0.5],
    [0, 1.1],
    [0.8, 0.2],
    [NaN, 1],
  ])
    expect(getPersonalBoxIntervalSliceError({ context, from: range[0], to: range[1] })).toBeInstanceOf(Error)
})
