import { expect, it } from "vitest"
import { lessonRoster } from "./routine-activities"
import type { Slot } from "#/world/town/routines"
const slot = (role: "student" | "teacher", map = "hall"): Slot => ({ from: 0, where: { map, cell: [1, 1] }, doing: "表示文言", activity: { kind: "lesson", role } })
it("uses explicit activity and map identities rather than interpreting action text", () => {
  const routines = {
    teacher: [slot("teacher")],
    pupil: [{ ...slot("student"), doing: "文言を変更" }],
    visitor: [{ ...slot("student"), activity: { kind: "records" } as const }],
    elsewhere: [slot("student", "other")],
  }
  expect(lessonRoster(routines, "hall")).toEqual({ teachers: ["teacher"], students: ["pupil"] })
})
it("does not count repeated slots twice or guess a map for a symbolic workplace", () => {
  expect(lessonRoster({ pupil: [slot("student"), slot("student")], symbolic: [{ ...slot("student"), where: "work" }] }, "hall")).toEqual({ teachers: [], students: ["pupil"] })
})
