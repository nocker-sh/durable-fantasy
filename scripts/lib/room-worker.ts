import type { SettingDocument } from "#/scripts/lib/setting-document"
const includes = (value: unknown, id: string): boolean => Array.isArray(value) && value.includes(id)
/** Require both sides of a job assignment before accepting a keeper or handling responsibility. */
export function roomHasWorker(room: SettingDocument, id: string, documents: ReadonlyMap<string, SettingDocument>): boolean {
  const worker = documents.get(id),
    building = documents.get(String(room.building))
  return (
    room.kind === "rooms" &&
    building?.kind === "buildings" &&
    worker?.kind === "residents" &&
    includes(building.rooms, room.id) &&
    includes(building.workers, id) &&
    includes(worker.work_rooms, room.id) &&
    includes(room.occupants, worker.title)
  )
}
