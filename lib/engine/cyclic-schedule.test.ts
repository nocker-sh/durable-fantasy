import { expect, it } from "vitest"
import { CyclicSchedule } from "#/lib/engine/cyclic-schedule"

it("selects half-open intervals, including the interval crossing the cycle boundary", () => {
  const entries = [
    { from: 18, name: "night" },
    { from: 7, name: "morning" },
    { from: 12, name: "afternoon" },
  ]
  const schedule = new CyclicSchedule(entries)
  for (const time of [0, 6.99, 18, 23.99]) expect(schedule.at(time)).toBe(entries[0])
  for (const time of [7, 11.99]) expect(schedule.at(time)).toBe(entries[1])
  for (const time of [12, 17.99]) expect(schedule.at(time)).toBe(entries[2])
  expect(entries.map((entry) => entry.from)).toEqual([18, 7, 12])
})

it("handles empty and constant schedules without inventing a boundary", () => {
  expect(new CyclicSchedule([]).at(10)).toBeNull()
  const single = { from: 7 }
  const schedule = new CyclicSchedule([single])
  for (const time of [0, 7, 23.99]) expect(schedule.at(time)).toBe(single)
})

it("rejects ambiguous or non-finite boundaries", () => {
  expect(() => new CyclicSchedule([{ from: 7 }, { from: 7 }])).toThrow(RangeError)
  for (const from of [NaN, Infinity, -Infinity]) expect(() => new CyclicSchedule([{ from }])).toThrow(RangeError)
})

it("rejects non-finite queries instead of selecting an arbitrary entry", () => {
  const schedule = new CyclicSchedule([{ from: 7 }, { from: 18 }])
  for (const time of [NaN, Infinity, -Infinity]) expect(() => schedule.at(time)).toThrow(RangeError)
})

it("keeps its captured boundaries when callers edit the input or a returned entry", () => {
  const morning = { from: 7, name: "morning" }
  const night = { from: 18, name: "night" }
  const entries = [night, morning]
  const schedule = new CyclicSchedule(entries)
  morning.from = 22
  const selected = schedule.at(19)
  if (selected) selected.from = NaN
  entries.splice(0, entries.length)
  expect(schedule.at(6)).toBe(night)
  expect(schedule.at(7)).toBe(morning)
  expect(schedule.at(17.99)).toBe(morning)
  expect(schedule.at(18)).toBe(night)
})
