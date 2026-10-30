import type { SettingDocument } from "#/scripts/lib/setting-document"
import { MIN_BED_LENGTH_M, MIN_BED_WIDTH_M } from "#/scripts/lib/spatial-rules"
type SleepingPlace = { id: string; resident: string; kind: string; grid_symbol?: string | null }
/** Every resident owns one ordinary bed; guest capacity cannot satisfy a household's bed count. */
export function auditSleepingPlaces(documents: ReadonlyMap<string, SettingDocument>): string[] {
  const errors: string[] = [],
    beds = new Map<string, { room: SettingDocument; place: SleepingPlace }>(),
    assignments = new Map<string, string[]>()
  for (const room of documents.values()) {
    if (room.kind !== "rooms") continue
    const places = (room.sleeping_places ?? (room.bed_capacity === 0 ? [] : undefined)) as SleepingPlace[] | undefined,
      guests = Number(room.guest_capacity ?? 0)
    if (!Array.isArray(places)) {
      errors.push(`${room.id}: missing sleeping assignments`)
      continue
    }
    if (!Number.isSafeInteger(guests) || guests < 0 || places.length + guests !== room.bed_capacity) errors.push(`${room.id}: sleeping capacity does not match assignments and guest slots`)
    const household = documents.get(String(room.building))?.residents as string[] | undefined
    for (const place of places) {
      if (place.kind !== "個別寝台") errors.push(`${room.id}: ordinary bed must be an individual sleeping place`)
      if (!place.id || beds.has(place.id)) errors.push(`${room.id}: duplicate or missing bed ID`)
      beds.set(place.id, { room, place })
      const resident = documents.get(place.resident)
      if (resident?.kind !== "residents") {
        errors.push(`${room.id}: bed occupant is not a resident`)
        continue
      }
      if (!household?.includes(resident.id)) errors.push(`${room.id}: occupant does not live in this building`)
      if (!(room.occupants as string[] | undefined)?.includes(resident.title)) errors.push(`${room.id}: room occupants disagree with bed occupants`)
      const list = assignments.get(resident.id) ?? []
      list.push(place.id)
      assignments.set(resident.id, list)
      if (resident.bedroom !== room.id || resident.bed_id !== place.id) errors.push(`${resident.id}: bedroom and bed references disagree`)
      if (room.grid && place.grid_symbol) {
        const furniture = room.furniture?.find((f) => f.symbol === place.grid_symbol)
        if (!furniture || furniture.owner !== resident.title) errors.push(`${room.id}: assigned bed has no matching furniture owner`)
        if (furniture && furniture.role !== "bed") errors.push(`${room.id}: sleeping assignment must use bed furniture`)
        if (furniture) {
          const sides = furniture.rect
            .slice(2)
            .map((cells) => cells * room.grid!.cell_m)
            .sort((a, b) => a - b)
          if (sides[0] < MIN_BED_WIDTH_M || sides[1] < MIN_BED_LENGTH_M) errors.push(`${room.id}: assigned bed is too small`)
        }
      } else if (room.grid || room.design_gate === "通過") errors.push(`${room.id}: bed has no designed grid footprint`)
    }
    if (room.grid && guests === 0)
      for (const furniture of room.furniture ?? [])
        if (furniture.role === "bed" && !places.some((place) => place.grid_symbol === furniture.symbol)) errors.push(`${room.id}: bed furniture has no sleeping assignment`)
  }
  for (const building of documents.values())
    if (building.kind === "buildings") {
      for (const id of (building.residents ?? []) as string[]) {
        const resident = documents.get(id),
          bed = beds.get(String(resident?.bed_id))
        if (!bed || bed.place.resident !== id || bed.room.building !== building.id) errors.push(`${building.id}: resident has no ordinary bed in this building: ${id}`)
      }
    }
  for (const resident of documents.values())
    if (resident.kind === "residents") {
      const candidates = resident.bedroom_candidates
      if (candidates !== undefined && (!Array.isArray(candidates) || !candidates.length || new Set(candidates).size !== candidates.length || !candidates.includes(resident.bedroom)))
        errors.push(`${resident.id}: bedroom candidates do not include one consistent selected bedroom`)
      const assigned = assignments.get(resident.id) ?? []
      if (assigned.length !== 1) errors.push(`${resident.id}: needs exactly one ordinary bed`)
      const bed = beds.get(String(resident.bed_id))
      if (!bed || bed.place.resident !== resident.id || bed.room.id !== resident.bedroom) errors.push(`${resident.id}: unresolved personal bed`)
    }
  return errors
}
