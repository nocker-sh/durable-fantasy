import type { SettingDocument } from "#/scripts/lib/setting-document"
import { roomHasWorker } from "#/scripts/lib/room-worker"
/** A maintenance assignment belongs to a real member of the home or a worker of this room. */
export function auditFurnitureMaintenance(documents: ReadonlyMap<string, SettingDocument>): string[] {
  const errors: string[] = []
  for (const room of documents.values()) {
    if (room.kind !== "rooms") continue
    const building = documents.get(String(room.building))
    for (const item of room.furniture ?? []) {
      const fail = (message: string) => errors.push(`${room.id}: ${item.symbol}: ${message}`)
      if (item.maintainers === undefined) {
        if (room.design_gate === "通過") fail("completed furniture has no maintenance assignment")
        continue
      }
      if (!item.maintainers.length || new Set(item.maintainers).size !== item.maintainers.length) fail("invalid maintenance assignment")
      for (const id of item.maintainers) {
        const resident = documents.get(id)
        if (Array.isArray(room.private_for) && !room.private_for.includes(id)) fail("maintainer has no access to this private room")
        const householdMember =
          building?.kind === "buildings" && Array.isArray(building.rooms) && building.rooms.includes(room.id) && Array.isArray(building.residents) && building.residents.includes(id)
        if (resident?.kind !== "residents" || !(householdMember || roomHasWorker(room, id, documents))) fail("maintainer does not belong to this home or workplace")
      }
    }
  }
  return errors
}
