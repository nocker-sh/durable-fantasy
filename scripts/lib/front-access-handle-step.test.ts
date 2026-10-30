import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { personalStorageSchema } from "#/scripts/lib/personal-storage-schema"
import { getFrontAccessHandleFrame } from "#/scripts/lib/get-front-access-handle-frame"
import { getFrontAccessHandleStepFrame } from "#/scripts/lib/get-front-access-handle-step-frame"
import { getFrontAccessHandleStepError } from "#/scripts/lib/get-front-access-handle-step-error"
import { getFrontAccessHandleStepSupportError } from "#/scripts/lib/get-front-access-handle-step-support-error"
import { getFrontAccessHandleFrameError } from "#/scripts/lib/get-front-access-handle-frame-error"
import { buildBody } from "#/world/scene/figure/body"
import { groundFootwear } from "#/world/scene/figure/footing"

function fixture(number = 3) {
  const room = readSetting(readFileSync(`.docs/settings/rooms/room-h1-${number}.md`, "utf8")),
    building = readSetting(readFileSync(".docs/settings/buildings/building-h1.md", "utf8"))
  return { room, building, slot: personalStorageSchema.parse(room.personal_storage)[0] }
}

it("keeps full planted shoes, actual raised-shoe clearances and native leg lengths in both directions", () => {
  for (const number of [3, 4]) {
    const source = fixture(number),
      before = JSON.stringify(source),
      review = source.slot.packing?.front_access?.handle_review?.step_review
    if (!review) throw new Error("Missing standing step source")
    expect(getFrontAccessHandleStepError(source)).toBeNull()
    for (const leaf of ["north", "south"] satisfies ("north" | "south")[])
      for (const phase of [0, 0.25, 0.5, 0.75, 1]) {
        const frame = getFrontAccessHandleStepFrame({ ...source, leaf, cycle: 0, phase })
        if (frame instanceof Error) throw frame
        expect(getFrontAccessHandleStepSupportError({ ...source, leaf, cycle: 0, phase, frame })).toBeNull()
        const actual = buildBody(frame.look, frame.posed.skeleton, null),
          leading: Readonly<Record<"north" | "south", "l" | "r">> = { north: "r", south: "l" }
        for (const side of ["l", "r"] satisfies ("l" | "r")[]) {
          const shoe = actual.footwear[side],
            height = Math.min(shoe.a[1], shoe.b[1]) - shoe.r + frame.posed.rootY,
            expected = { value: 0 }
          if ((phase === 0.25 && side === leading[leaf]) || (phase === 0.75 && side !== leading[leaf])) expected.value = review.foot_lift_m
          expect(height).toBeCloseTo(expected.value, 12)
          const p = frame.posed.skeleton.p,
            rest = frame.native.rest
          for (const pair of [
            [`thigh_${side}`, `calf_${side}`],
            [`calf_${side}`, `foot_${side}`],
          ] satisfies (readonly [`thigh_${"l" | "r"}` | `calf_${"l" | "r"}`, `calf_${"l" | "r"}` | `foot_${"l" | "r"}`])[])
            expect(Math.hypot(...p[pair[1]].map((value, axis) => value - p[pair[0]][axis]))).toBeCloseTo(Math.hypot(...rest[pair[1]].map((value, axis) => value - rest[pair[0]][axis])), 12)
        }
      }
    expect(JSON.stringify(source)).toBe(before)
  }
})

it("grounds both shoes before the first step and joins every cycle and static endpoint exactly", () => {
  for (const number of [3, 4])
    for (const leaf of ["north", "south"] satisfies ("north" | "south")[]) {
      const source = fixture(number),
        start = getFrontAccessHandleStepFrame({ ...source, leaf, cycle: 0, phase: 0 }),
        end = getFrontAccessHandleStepFrame({ ...source, leaf, cycle: 3, phase: 1 })
      if (start instanceof Error || end instanceof Error) throw new Error("Missing source step endpoints")
      const staticStart = getFrontAccessHandleFrame({ ...source, leaf, progress: 0 }),
        staticEnd = getFrontAccessHandleFrame({ ...source, leaf, progress: 1 })
      if (staticStart instanceof Error || staticEnd instanceof Error) throw new Error("Missing source standing endpoints")
      expect(start.posed).toEqual(staticStart.posed)
      expect(start.body).toEqual(staticStart.body)
      expect(end.posed).toEqual(staticEnd.posed)
      expect(end.body).toEqual(staticEnd.body)
      const feet = groundFootwear(buildBody(start.look, start.skeleton, null).footwear)
      for (const foot of feet.feet) expect(foot.clearance).toBeCloseTo(0, 12)
      for (const cycle of [0, 1, 2]) {
        const before = getFrontAccessHandleStepFrame({ ...source, leaf, cycle, phase: 1 }),
          after = getFrontAccessHandleStepFrame({ ...source, leaf, cycle: cycle + 1, phase: 0 })
        if (before instanceof Error || after instanceof Error) throw new Error("Missing adjacent cycles")
        expect(after.body).toEqual(before.body)
        expect(after.parts).toEqual(before.parts)
        expect(after.posed).toEqual(before.posed)
      }
    }
})

it("anchors support independently and refuses a translated actor or a body moved below the floor", () => {
  const source = fixture(),
    frame = getFrontAccessHandleStepFrame({ ...source, leaf: "north", cycle: 0, phase: 0.25 })
  if (frame instanceof Error) throw frame
  expect(getFrontAccessHandleStepSupportError({ ...source, leaf: "north", cycle: 0, phase: 0.25, frame: { ...frame, body: [frame.body[0] + 0.01, frame.body[1]] } })).toBeInstanceOf(Error)
  expect(getFrontAccessHandleFrameError({ frame: { ...frame, posed: { ...frame.posed, rootY: frame.posed.rootY - 0.01 } } })?.message).toBe("Native body floor clearance remains unresolved")
})

it("refuses invalid cycles, unbounded sampling and unreachable shoe lifts", () => {
  const source = fixture(),
    review = source.slot.packing?.front_access?.handle_review?.step_review
  if (!review) throw new Error("Missing standing step source")
  for (const cycle of [-1, 4, 0.5, NaN]) expect(getFrontAccessHandleStepFrame({ ...source, leaf: "north", cycle, phase: 0.5 })).toBeInstanceOf(Error)
  for (const phase of [-1, 2, NaN]) expect(getFrontAccessHandleStepFrame({ ...source, leaf: "north", cycle: 0, phase })).toBeInstanceOf(Error)
  for (const count of [0, -1, 0.5, 129, NaN]) {
    review.samples_per_cycle = count
    expect(getFrontAccessHandleStepError(source)).toBeInstanceOf(Error)
  }
  review.samples_per_cycle = 8
  review.foot_lift_m = 2
  expect(getFrontAccessHandleStepError(source)).toBeInstanceOf(Error)
})
