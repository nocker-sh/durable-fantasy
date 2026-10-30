import { getTextileDesignPrerequisites } from "#/scripts/lib/get-textile-design-prerequisites"
import { getTableServicePrerequisites } from "#/scripts/lib/get-table-service-prerequisites"
import type { SettingDocument } from "#/scripts/lib/setting-document"
export function auditDesignDependencies(documents: ReadonlyMap<string, SettingDocument>): string[] {
  const errors: string[] = []
  for (const doc of documents.values()) {
    const dependencies = doc.design_dependencies
    const required = referencedPrerequisites(doc)
    if (dependencies === undefined && doc.design_gate !== "通過" && !required.size) continue
    if (!Array.isArray(dependencies) || dependencies.some((id) => typeof id !== "string") || new Set(dependencies).size !== dependencies.length) {
      errors.push(`${doc.id}: invalid or missing design dependencies`)
      continue
    }
    for (const id of required) if (!dependencies.includes(id)) errors.push(`${doc.id}: referenced prerequisite is missing from design dependencies: ${id}`)
    for (const id of dependencies as string[]) {
      const target = documents.get(id)
      if (id === doc.id || !target) errors.push(`${doc.id}: invalid design dependency ${id}`)
      else if (doc.design_gate === "通過" && target.design_gate !== "通過") errors.push(`${doc.id}: prerequisite design is unfinished: ${id}`)
    }
  }
  return errors
}

/** Structural work and travel relations must also participate in the completion gate. */
function referencedPrerequisites(doc: SettingDocument): Set<string> {
  const journeys = (doc.outdoor_journeys ?? []) as { map: string; from: { document: string; room: string }; to_facility: string }[]
  const hotWork = doc.hot_work as { handler: string } | undefined
  const care = doc.animal_care as { keeper: string } | undefined
  const storage = (doc.ground_storage ?? []) as { handler: string }[]
  const classroom = doc.classroom as { teachers: string[]; routine_map: string; places: { resident: string }[] } | undefined
  const roomUsers: string[] = []
  if (doc.kind === "rooms" && Array.isArray(doc.users)) {
    const users: readonly unknown[] = doc.users
    for (const user of users) if (typeof user === "string") roomUsers.push(user)
  }
  const drying = doc.laundry_drying as { racks: { handler: string }[] } | undefined
  return new Set([
    ...roomUsers,
    ...getTextileDesignPrerequisites(doc),
    ...(doc.foundation ? [String(doc.map)] : []),
    ...((doc.entry_steps ?? []) as { room: string }[]).map((steps) => steps.room),
    ...(doc.furniture ?? []).flatMap((item) => item.maintainers ?? []),
    ...((doc.sleeping_places ?? []) as { resident: string }[]).map((place) => place.resident),
    ...((doc.personal_storage ?? []) as { resident: string }[]).map((slot) => slot.resident),
    ...((doc.household_meal as { seats: { resident: string }[] } | undefined)?.seats ?? []).map((seat) => seat.resident),
    ...(classroom ? [String(doc.building), classroom.routine_map, ...classroom.teachers, ...classroom.places.map((place) => place.resident)] : []),
    ...(doc.kind === "residents" ? ((doc.learning_rooms ?? []) as string[]) : []),
    ...(hotWork ? [String(doc.building), hotWork.handler] : []),
    ...(care ? [String(doc.building), care.keeper] : []),
    ...journeys.flatMap((journey) => [journey.map, journey.from.document, journey.from.room, journey.to_facility]),
    ...getTableServicePrerequisites(doc),
    ...(drying ? [String(doc.building), ...drying.racks.map((rack) => rack.handler)] : []),
    ...(storage.length ? [String(doc.building), ...storage.map((entry) => entry.handler)] : []),
    ...(doc.kind === "residents" ? ((doc.work_rooms ?? []) as string[]) : []),
    ...(doc.kind === "buildings" ? ((doc.workers ?? []) as string[]) : []),
    ...(doc.kind === "buildings" && typeof doc.home_building === "string" && doc.home_building !== doc.id ? [doc.home_building] : []),
  ])
}
