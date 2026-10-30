import { expect, it } from "vitest"
import { INTERIORS } from "#/world/town/interiors"
import { withRoutineActivitySpot } from "#/world/town/with-routine-activity-spot"
import type { Slot } from "#/world/town/routine-types"

const lesson: Slot = { from: 1230, where: "home", doing: "字を教える", activity: { kind: "lesson", role: "teacher" } }

it("uses the authored teacher's floor and preserves the rest of the slot", () => {
  const resolved = withRoutineActivitySpot({ name: "クリスティアン", slot: lesson, rooms: INTERIORS })
  expect(resolved.where).toMatchObject({ map: "phanthiet-in-h-m5" })
  expect(resolved.from).toBe(lesson.from)
  expect(resolved.doing).toBe(lesson.doing)
  expect(resolved.activity).toBe(lesson.activity)
  expect(lesson.where).toBe("home")
})

it("does not borrow another role, resident or floor", () => {
  const student: Slot = { ...lesson, activity: { kind: "lesson", role: "student" } }
  expect(withRoutineActivitySpot({ name: "クリスティアン", slot: student, rooms: INTERIORS })).toBe(student)
  expect(withRoutineActivitySpot({ name: "unknown", slot: lesson, rooms: INTERIORS })).toBe(lesson)
  expect(withRoutineActivitySpot({ name: "クリスティアン", slot: lesson, rooms: INTERIORS.filter((room) => room.floor !== 0) })).toBe(lesson)
})

it("leaves ordinary slots and missing room assignments untouched", () => {
  const ordinary: Slot = { from: 0, where: "home", doing: "眠る" }
  expect(withRoutineActivitySpot({ name: "クリスティアン", slot: ordinary, rooms: INTERIORS })).toBe(ordinary)
  expect(withRoutineActivitySpot({ name: "クリスティアン", slot: lesson, rooms: [] })).toBe(lesson)
})

it("resolves records without inventing a lesson role", () => {
  const records: Slot = { from: 1230, where: "home", doing: "帳面をつける", activity: { kind: "records" } }
  expect(withRoutineActivitySpot({ name: "エーリヒ", slot: records, rooms: INTERIORS }).where).toMatchObject({ map: "phanthiet-in-h-m5-floor-2" })
  expect(withRoutineActivitySpot({ name: "エーリヒ", slot: lesson, rooms: INTERIORS })).toBe(lesson)
})
