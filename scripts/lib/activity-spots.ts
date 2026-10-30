import { seatForward } from "#/world/town/seat-forward"
import { seatDimensions } from "#/scripts/lib/seat-dimensions"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { ActivitySpot } from "#/world/town/room-fixtures"

export function compileActivitySpots(building: SettingDocument, rooms: readonly SettingDocument[]): ActivitySpot[] {
  const result: ActivitySpot[] = []
  for (const room of rooms)
    if (room.building === building.id && room.grid) {
      const oxState = room.origin as number[],
        ox = oxState[0],
        oz = oxState[1],
        k = room.grid.cell_m
      const start = result.length
      const add = (inputProps: { resident: string; at: number[]; kind: ActivitySpot["kind"]; role?: ActivitySpot["role"] }) => {
        const resident = inputProps.resident
        const at = inputProps.at
        const kind = inputProps.kind
        const role = inputProps.role

        if (at.length !== 2 || !at.every(Number.isFinite)) throw new Error("Activity spot has no placed access")
        result.push({ resident: resident.replace(/^resident-/, ""), kind, role, floor: Number(room.floor), x: (ox + at[0] + 0.5) * k, z: (oz + at[1] + 0.5) * k })
      }
      const classroom = room.classroom as { teacher_places: { resident: string; at: number[] }[]; places: { resident: string; chair: string }[] } | undefined
      for (const teacher of classroom?.teacher_places ?? []) add({ resident: teacher.resident, at: teacher.at, kind: "lesson", role: "teacher" })
      for (const pupil of classroom?.places ?? []) {
        const chair = room.furniture?.find((f) => f.symbol === pupil.chair)
        if (!chair?.access[0]) throw new Error("Pupil has no chair access")
        add({ resident: pupil.resident, at: chair.access[0], kind: "lesson", role: "student" })
        const seat = seatDimensions(chair.seat, chair.rect[2] * k, chair.rect[3] * k)
        if (!seat.footRest || seat.occupantForward === undefined) throw new Error("Pupil needs a supported seated place")
        const xState = chair.rect,
          x = xState[0],
          z = xState[1],
          w = xState[2],
          d = xState[3]
        result[result.length - 1].seat = { x: (ox + x + w / 2) * k, z: (oz + z + d / 2) * k, height: seat.height, forward: seat.occupantForward, facing: seat.facing }
      }
      for (const record of (room.record_places ?? []) as { resident: string; furniture: string; access_index: number }[]) {
        const support = room.furniture?.find((f) => f.symbol === record.furniture),
          at = support?.access[record.access_index]
        if (!at) throw new Error("Record keeper has no table access")
        add({ resident: record.resident, at: at, kind: "records" })
        const xState2 = support!.rect,
          x = xState2[0],
          z = xState2[1],
          w = xState2[2],
          d = xState2[3]
        result[result.length - 1].facing = [(ox + x + w / 2) * k, (oz + z + d / 2) * k]
      }
      const lesson = result.slice(start).filter((p) => p.kind === "lesson")
      const teachers = lesson.filter((p) => p.role === "teacher"),
        students = lesson.filter((p) => p.role === "student")
      if (students.length && teachers.length !== 1) throw new Error("A classroom needs one placed teacher")
      if (students.length) {
        const teacher = teachers[0]
        for (const student of students) {
          const direction = seatForward(student.seat?.facing ?? "n")
          student.facing = student.seat ? [student.x + direction[0], student.z + direction[1]] : [teacher.x, teacher.z]
        }
        teacher.facing = [students.reduce((sum, p) => sum + p.x, 0) / students.length, students.reduce((sum, p) => sum + p.z, 0) / students.length]
      }
    }
  const identities = new Set<string>()
  for (const spot of result) {
    const key = JSON.stringify([spot.floor, spot.resident, spot.kind, spot.role ?? null])
    if (identities.has(key)) throw new Error(`Duplicate activity place: ${spot.resident}`)
    identities.add(key)
  }
  return result
}
