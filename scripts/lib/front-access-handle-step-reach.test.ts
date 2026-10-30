import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { personalStorageSchema } from "#/scripts/lib/personal-storage-schema"
import { getFrontAccessHandleStepReachReview } from "#/scripts/lib/get-front-access-handle-step-reach-review"
import { getFrontAccessHandleStepFrame } from "#/scripts/lib/get-front-access-handle-step-frame"
import { getFrontAccessHandleFrameError } from "#/scripts/lib/get-front-access-handle-frame-error"
import { getFrontAccessHandleStepError } from "#/scripts/lib/get-front-access-handle-step-error"

function fixture(number = 3) {
  const room = readSetting(readFileSync(`.docs/settings/rooms/room-h1-${number}.md`, "utf8")),
    building = readSetting(readFileSync(".docs/settings/buildings/building-h1.md", "utf8"))
  return { room, building, slot: personalStorageSchema.parse(room.personal_storage)[0] }
}

it("covers both actual legs and directions from start to end without any unresolved gaps", () => {
  for (const number of [3, 4]) {
    const source = fixture(number),
      before = JSON.stringify(source),
      review = getFrontAccessHandleStepReachReview(source)
    if (review instanceof Error) throw review
    expect(review.map((entry) => entry.leaf)).toEqual(["north", "south"])
    for (const leaf of review)
      for (const side of ["l", "r"] satisfies ("l" | "r")[]) {
        const intervals = leaf.intervals.filter((interval) => interval.side === side)
        expect(intervals.length).toBeGreaterThan(0)
        expect(intervals[0].from).toBe(0)
        expect(intervals[intervals.length - 1].to).toBe(1)
        for (const pair of intervals.entries()) {
          expect(pair[1].from).toBeLessThan(pair[1].to)
          expect([pair[1].kneeLocalSpeed, pair[1].footLocalSpeed, pair[1].bodySpeed].every((speed) => Number.isFinite(speed) && speed > 0)).toBe(true)
          if (pair[0]) expect(pair[1].from).toBe(intervals[pair[0] - 1].to)
        }
      }
    expect(JSON.stringify(source)).toBe(before)
  }
})

it("rejects an unreachable quarter-cycle hidden between otherwise clear authored samples", () => {
  const source = fixture(),
    step = source.slot.packing?.front_access?.handle_review?.step_review
  if (!step?.reach_review) throw new Error("Missing leg interval proposal")
  step.foot_lift_m = 2
  step.samples_per_cycle = 2
  for (const phase of [0, 0.5, 1]) {
    const frame = getFrontAccessHandleStepFrame({ ...source, leaf: "north", cycle: 0, phase })
    if (frame instanceof Error) throw frame
    expect(getFrontAccessHandleFrameError({ frame })).toBeNull()
  }
  expect(getFrontAccessHandleStepFrame({ ...source, leaf: "north", cycle: 0, phase: 0.25 })).toBeInstanceOf(Error)
  expect(getFrontAccessHandleStepReachReview(source)).toBeInstanceOf(Error)
  expect(getFrontAccessHandleStepError(source)).toBeInstanceOf(Error)
})
