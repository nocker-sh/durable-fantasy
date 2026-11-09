import type { Slot } from "#/world/town/routine-types"
/** Activity identities are independent of the text shown for a resident's current action. */
export function lessonRoster(routines: Readonly<Record<string, readonly Slot[]>>, map: string): { teachers: string[]; students: string[] } {
  const teachers = new Set<string>(),
    students = new Set<string>()
  for (const entry of Object.entries(routines)) {
    const name = entry[0]
    const slots = entry[1]
    for (const slot of slots) {
      if (slot.activity?.kind !== "lesson" || typeof slot.where === "string" || slot.where.map !== map) continue
      ;(slot.activity.role === "teacher" ? teachers : students).add(name)
    }
  }
  return { teachers: [...teachers], students: [...students] }
}
