import type { SettingDocument } from "#/scripts/lib/setting-document"
/** Employment does not assign a home or a bed; those remain with the resident's own household. */
export function auditWorkerAssignments(documents: ReadonlyMap<string, SettingDocument>): string[] {
  const errors: string[] = []
  for (const resident of documents.values())
    if (resident.kind === "residents") {
      const rooms = (resident.work_rooms ?? []) as string[]
      if (new Set(rooms).size !== rooms.length) errors.push(`${resident.id}: duplicate work room`)
      for (const id of rooms) {
        const room = documents.get(id),
          building = room ? documents.get(String(room.building)) : undefined
        if (room?.kind !== "rooms" || !(room.occupants as string[] | undefined)?.includes(resident.title)) errors.push(`${resident.id}: work room does not include this worker`)
        if (building?.kind !== "buildings" || !(building.workers as string[] | undefined)?.includes(resident.id)) errors.push(`${resident.id}: work room has no matching building staff assignment`)
        if (building?.kind === "buildings" && !(building.rooms as string[] | undefined)?.includes(id)) errors.push(`${resident.id}: work room is missing from its building inventory`)
      }
    }
  for (const building of documents.values())
    if (building.kind === "buildings") {
      const workers = (building.workers ?? []) as string[]
      if (building.home_building !== undefined) {
        const home = documents.get(String(building.home_building))
        if (home?.kind !== "buildings") errors.push(`${building.id}: workplace has no matching home building`)
        for (const id of workers) {
          const resident = documents.get(id),
            bedroom = documents.get(String(resident?.bedroom))
          if (!(home?.residents as string[] | undefined)?.includes(id) || bedroom?.kind !== "rooms" || bedroom.building !== home?.id)
            errors.push(`${building.id}: worker does not live in its declared home: ${id}`)
        }
      }
      if (new Set(workers).size !== workers.length) errors.push(`${building.id}: duplicate worker`)
      for (const id of workers) {
        const resident = documents.get(id)
        if (
          resident?.kind !== "residents" ||
          !((resident.work_rooms ?? []) as string[]).some((roomId) => {
            const room = documents.get(roomId)
            return (
              room?.kind === "rooms" &&
              room.building === building.id &&
              (building.rooms as string[] | undefined)?.includes(roomId) &&
              (room.occupants as string[] | undefined)?.includes(resident.title)
            )
          })
        )
          errors.push(`${building.id}: worker has no matching work room`)
      }
    }
  return errors
}
