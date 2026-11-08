import { afterEach, expect, it, vi } from "vitest"
import { activityPose } from "#/world/town/activity-pose"
import { projectActivityPose } from "#/world/town/project-activity-pose"
import { INTERIORS } from "#/world/town/interiors"
import { ROOM_SCALE } from "#/world/town/interior-rules"
import hall from "#/world/town/floorplan/authored/h-m5"
import * as routines from "#/world/town/slot-at"

afterEach(() => vi.restoreAllMocks())
const map = "phanthiet-in-h-m5"
const minute = 21 * 60 + 30
const room = INTERIORS.find((room) => room.id === map)!
const students = hall.activitySpots.filter((spot) => spot.role === "student")

it("supplies the assigned seated body and chair direction together, only at the right place and time", () => {
  for (const student of students) {
    const pose = activityPose(student.resident, minute, map)!
    expect(pose.facing).toEqual([(Math.floor((room.x0 + student.x * ROOM_SCALE) * 2) + 0.5) / 2, (Math.floor((room.z0 + student.z * ROOM_SCALE) * 2) + 0.5) / 2 - 1])
    expect(pose.seat?.height).toBeCloseTo(0.44 * ROOM_SCALE)
    expect(pose.seat?.heading).toBe(Math.PI)
    expect(pose.seat?.at).not.toEqual([room.x0 + student.x * ROOM_SCALE, room.z0 + student.z * ROOM_SCALE])
    expect(activityPose(student.resident, minute, "phanthiet-market")).toBeNull()
    expect(activityPose(student.resident, 12 * 60, map)).toBeNull()
  }
})

it("keeps the teacher standing and facing the students", () => {
  const teacher = hall.activitySpots.find((spot) => spot.role === "teacher")!
  expect(activityPose(teacher.resident, minute, map)).toEqual({
    seat: null,
    facing: [room.x0 + (students.reduce((sum, spot) => sum + spot.x, 0) / students.length) * ROOM_SCALE, room.z0 + (students.reduce((sum, spot) => sum + spot.z, 0) / students.length) * ROOM_SCALE],
  })
})

it("faces the record table on the upper floor only while working there", () => {
  const upper = INTERIORS.find((room) => room.id === "phanthiet-in-h-m5-floor-2")!
  const table = upper.furniture.find((piece) => piece.name === "書類を広げ照合する卓")!
  const keeper = hall.activitySpots.find((spot) => spot.kind === "records")!
  expect(activityPose(keeper.resident, minute, upper.id)).toEqual({ facing: [table.x, table.z], seat: null })
  expect(activityPose(keeper.resident, 23 * 60 + 10, upper.id)).toBeNull()
})

it("does not borrow a matching activity from a different scheduled map", () => {
  vi.spyOn(routines, "slotAt").mockReturnValue({
    from: minute,
    doing: "読み書き",
    activity: { kind: "lesson", role: "student" },
    where: { map: "phanthiet-in-h-m5-floor-2", cell: [1, 1] },
  })
  expect(activityPose(students[0].resident, minute, map)).toBeNull()
})

it("does not let a caller mutate the cached projection for future schedule updates", () => {
  const pose = activityPose(students[0].resident, minute, map)!
  const expected = structuredClone(pose)
  pose.facing![0] = 999
  pose.seat!.at[0] = 999
  expect(activityPose(students[0].resident, minute, map)).toEqual(expected)
})

it("projects the body forward into each chair direction and preserves its authored heading", () => {
  for (const [facing, dx, dz, heading] of [
    ["n", 0, -1, Math.PI],
    ["s", 0, 1, 0],
    ["w", -1, 0, -Math.PI / 2],
    ["e", 1, 0, Math.PI / 2],
  ] as const) {
    const pose = projectActivityPose(10, 20, { resident: "test", floor: 0, x: 2, z: 3, kind: "lesson", seat: { x: 2, z: 3, height: 0.36, forward: 0.08, facing } })
    expect(pose.seat).toEqual({ at: [10 + (2 + dx * 0.08) * ROOM_SCALE, 20 + (3 + dz * 0.08) * ROOM_SCALE], height: 0.36 * ROOM_SCALE, heading })
  }
})
