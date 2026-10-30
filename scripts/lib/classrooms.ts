import type { Slot } from "#/world/town/routine-types"
import { lessonRoster } from "#/world/town/routine-activities"
import { roomHasWorker } from "#/scripts/lib/room-worker"
import { crowdedSeatCentres } from "#/scripts/lib/spatial-rules"
import type { SettingDocument } from "#/scripts/lib/setting-document"
type Classroom = { teachers: string[]; routine_map: string; places: { resident: string; chair: string; table: string }[] }
/** Match named learners to real seats and the code's lesson roster, without inventing a timetable. */
export function auditClassrooms(documents: ReadonlyMap<string, SettingDocument>, routines: Readonly<Record<string, readonly Slot[]>>): string[] {
  const errors: string[] = []
  for (const room of documents.values()) {
    const classroom = room.classroom as Classroom | undefined
    if (!classroom) continue
    const fail = (message: string) => errors.push(`${room.id}: ${message}`)
    if (room.kind !== "rooms" || !room.grid) {
      fail("Classroom has no placed room")
      continue
    }
    const roster = lessonRoster(routines, classroom.routine_map.replace(/^map-/, ""))
    const names = (ids: string[]) => ids.map((id) => documents.get(id)?.title)
    const matches = (ids: string[], expected: string[]) => ids.length === expected.length && new Set(ids).size === ids.length && expected.every((name) => names(ids).includes(name))
    if (!matches(classroom.teachers, roster.teachers)) fail("Teachers disagree with the routine lesson roster")
    for (const id of classroom.teachers) if (!roomHasWorker(room, id, documents)) fail("Teacher has no matching work assignment")
    const learnerIds = classroom.places.map((p) => p.resident),
      chairs: number[][] = []
    if (!matches(learnerIds, roster.students)) fail("Learners disagree with the routine lesson roster")
    if (new Set(classroom.places.map((p) => p.chair)).size !== classroom.places.length) fail("Learners share the same chair")
    for (const place of classroom.places) {
      const resident = documents.get(place.resident),
        chair = room.furniture?.find((f) => f.symbol === place.chair),
        table = room.furniture?.find((f) => f.symbol === place.table)
      if (resident?.kind !== "residents" || !(room.occupants as string[] | undefined)?.includes(resident.title)) fail("Learner is missing from the room's occupants")
      if (!chair || chair.role !== "seat" || table?.role !== "table" || !table.seat_symbols?.includes(place.chair)) fail("Learner has no chair at the assigned table")
      else chairs.push(chair.rect)
      if (!((resident?.learning_rooms ?? []) as string[]).includes(room.id)) fail("Learner has no matching learning-room reference")
    }
    if (crowdedSeatCentres(chairs, room.grid.cell_m)) fail("Classroom seat centres crowd the learners")
  }
  return errors
}
