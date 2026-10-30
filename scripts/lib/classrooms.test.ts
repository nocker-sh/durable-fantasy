import { expect, it } from "vitest"
import { auditClassrooms } from "./classrooms"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { Slot } from "#/world/town/routines"
const base = (id: string, kind: string): SettingDocument => ({ id, kind, title: id, status: "設計中", source: "test", design_gate: "未通過", issues: [] })
function fixture() {
  const teacher = { ...base("teacher", "residents"), work_rooms: ["room"] }
  const student = { ...base("student", "residents"), learning_rooms: ["room"] }
  const room: SettingDocument = {
    ...base("room", "rooms"),
    building: "building",
    occupants: [teacher.title, student.title],
    grid: { cell_m: 0.5, rows: ["...."] },
    classroom: { teachers: [teacher.id], routine_map: "map-hall", places: [{ resident: student.id, chair: "c", table: "t" }] },
    furniture: [
      { symbol: "c", name: "椅子", owner: "町", source: "木工", rect: [0, 0, 1, 1], access: [[0, 1]], role: "seat" },
      { symbol: "t", name: "机", owner: "町", source: "木工", rect: [0, 1, 2, 1], access: [[0, 0]], role: "table", seat_symbols: ["c"] },
    ],
  }
  const building = { ...base("building", "buildings"), rooms: [room.id], workers: [teacher.id] }
  const documents = new Map([teacher, student, room, building].map((d) => [d.id, d]))
  const slot = (role: "teacher" | "student"): Slot => ({ from: 0, where: { map: "hall", cell: [0, 0] }, doing: "表示", activity: { kind: "lesson", role } })
  const routines = { teacher: [slot("teacher")], student: [slot("student")] }
  return { documents, routines, room, student, teacher }
}
it("matches real lessons, work assignments, and individually assigned furniture without rewriting", () => {
  const f = fixture(),
    before = JSON.stringify([...f.documents])
  expect(auditClassrooms(f.documents, f.routines)).toEqual([])
  expect(JSON.stringify([...f.documents])).toBe(before)
})
it("rejects omitted participants and an unassigned teacher", () => {
  const f = fixture()
  f.teacher.work_rooms = []
  f.routines.student = []
  expect(auditClassrooms(f.documents, f.routines)).toEqual(expect.arrayContaining(["room: Teacher has no matching work assignment", "room: Learners disagree with the routine lesson roster"]))
})
it("requires a real chair at the assigned table and a reciprocal learning reference", () => {
  const f = fixture()
  f.room.furniture![1].seat_symbols = []
  f.student.learning_rooms = []
  expect(auditClassrooms(f.documents, f.routines)).toEqual(expect.arrayContaining(["room: Learner has no chair at the assigned table", "room: Learner has no matching learning-room reference"]))
})
it("rejects shared chairs and physically crowded learner seats", () => {
  const f = fixture(),
    second = { ...f.student, id: "second", title: "second" }
  f.documents.set(second.id, second)
  const routines = { ...f.routines, second: f.routines.student }
  const classroom = f.room.classroom as { places: { resident: string; chair: string; table: string }[] }
  classroom.places.push({ resident: second.id, chair: "c", table: "t" })
  ;(f.room.occupants as string[]).push(second.title)
  expect(auditClassrooms(f.documents, routines)).toContain("room: Learners share the same chair")
  classroom.places[1].chair = "d"
  f.room.furniture!.push({ ...f.room.furniture![0], symbol: "d", rect: [1, 0, 1, 1] })
  f.room.furniture![1].seat_symbols!.push("d")
  expect(auditClassrooms(f.documents, routines)).toContain("room: Classroom seat centres crowd the learners")
})
