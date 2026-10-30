import { expect, it } from "vitest"
import { getResidentDayBudget } from "#/world/town/get-resident-day-budget"
import { residentDayPlanSchema } from "#/world/town/resident-day-plan-schema"

const fixture = () =>
  residentDayPlanSchema.parse({
    scope: "resident_workday_time_reservation",
    status: "proposed",
    clock: "jst_midnight_minutes",
    pending: ["Durations unmeasured"],
    segments: [
      { kind: "stay", from_min: 0, to_min: 480, purpose: "Sleep", activity: "sleep", place: { kind: "room", room: "bed" } },
      { kind: "travel", from_min: 480, to_min: 490, purpose: "Go to work", from: { kind: "room", room: "bed" }, to: { kind: "district", symbol: "W" } },
      { kind: "stay", from_min: 490, to_min: 970, purpose: "Work", activity: "work", place: { kind: "district", symbol: "W" } },
      { kind: "travel", from_min: 970, to_min: 980, purpose: "Go home", from: { kind: "district", symbol: "W" }, to: { kind: "room", room: "bed" } },
      { kind: "stay", from_min: 980, to_min: 1440, purpose: "Rest", activity: "rest", place: { kind: "room", room: "bed" } },
    ],
  })

it("reserves the complete cyclic day once without mutating its proposal", () => {
  const plan = fixture(),
    before = JSON.stringify(plan),
    budget = getResidentDayBudget(plan)
  expect(budget).toMatchObject({ totalMinutes: 1440, minutesByActivity: { sleep: 480, work: 480, rest: 460, travel: 20 } })
  expect(JSON.stringify(plan)).toBe(before)
})

it("rejects gaps, overlap, reversed and zero intervals, including the first and last minutes", () => {
  for (const start of [479, 481, 490, 491]) {
    const plan = fixture()
    plan.segments[1].from_min = start
    expect(getResidentDayBudget(plan)).toEqual(new Error("Proposed day has a gap, overlap or nonpositive interval"))
  }
  const plan = fixture()
  plan.segments[0].from_min = 1
  expect(getResidentDayBudget(plan)).toBeInstanceOf(Error)
  plan.segments[0].from_min = 0
  plan.segments[4].to_min = 1439
  expect(getResidentDayBudget(plan)).toEqual(new Error("Proposed day does not reserve the whole day"))
})

it("requires travel for a place change and closes the midnight seam", () => {
  const plan = fixture(),
    first = plan.segments[0]
  if (first.kind !== "stay") throw new Error("Missing sleep")
  first.place = { kind: "room", room: "other" }
  expect(getResidentDayBudget(plan)).toEqual(new Error("Proposed day changes place without reserved travel"))
  first.place = { kind: "room", room: "bed" }
  plan.segments[4] = { kind: "travel", from_min: 980, to_min: 1440, purpose: "Travel elsewhere", from: { kind: "room", room: "bed" }, to: { kind: "room", room: "other" } }
  expect(getResidentDayBudget(plan)).toEqual(new Error("Proposed day changes place at midnight"))
})

it("rejects invalid clocks, states and noninteger or out-of-day coordinates", () => {
  const plan = fixture()
  for (const clock of ["utc", null, 1440]) expect(getResidentDayBudget({ ...plan, clock })).toBeInstanceOf(Error)
  expect(getResidentDayBudget({ ...plan, status: "approved" })).toBeInstanceOf(Error)
  expect(getResidentDayBudget({ ...plan, segments: [] })).toBeInstanceOf(Error)
  for (const minute of [-1, 0.5, 1441, Infinity, NaN]) {
    plan.segments[0].from_min = minute
    expect(getResidentDayBudget(plan)).toBeInstanceOf(Error)
  }
})
