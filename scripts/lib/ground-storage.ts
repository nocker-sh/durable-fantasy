import { roomHasWorker } from "#/scripts/lib/room-worker"
import { auditRoomClearance } from "#/scripts/lib/room-clearance"
import type { SettingDocument } from "#/scripts/lib/setting-document"
type GroundStorage = { furniture: string; contents: string; handler: string }
/** A ground-delivered load must reach the outside without stairs or private bedrooms. */
export function auditGroundStorage(documents: ReadonlyMap<string, SettingDocument>): string[] {
  const errors: string[] = []
  for (const room of documents.values()) {
    const storage = (room.ground_storage ?? []) as GroundStorage[]
    if (!storage.length) continue
    const fail = (message: string) => errors.push(`${room.id}: ${message}`)
    const building = documents.get(String(room.building)),
      inventory = building?.rooms as string[] | undefined
    if (room.kind !== "rooms" || !room.grid || building?.kind !== "buildings" || !inventory?.includes(room.id) || room.floor !== 0) {
      fail("Ground storage has no ground-floor room in its building")
      continue
    }
    const used = new Set<string>()
    for (const entry of storage) {
      if (used.has(entry.furniture)) fail("Ground storage furniture is assigned more than once")
      used.add(entry.furniture)
      if (!roomHasWorker(room, entry.handler, documents)) fail("Ground storage handler has no matching work assignment")
      const furniture = room.furniture?.find((f) => f.symbol === entry.furniture)
      if (!entry.contents || furniture?.role !== "bulk_storage") fail("Ground storage has no matching bulk furniture and contents")
      if (furniture) {
        if (!furniture.access.length) fail("Ground storage has no handling position")
        const xState = furniture.rect,
          x = xState[0],
          y = xState[1],
          w = xState[2],
          h = xState[3]
        let placed = true
        for (let row = y; row < y + h && placed; row++)
          for (let column = x; column < x + w; column++)
            if (room.grid.rows[row]?.[column] !== furniture.symbol) {
              placed = false
              break
            }
        if (!placed) fail("Ground storage footprint does not match its room grid")
      }
    }
    for (const handler of new Set(storage.map((entry) => entry.handler))) {
      const reached = new Set<string>(),
        queue = [room.id]
      let outside = false
      for (let i = 0; i < queue.length; i++) {
        const current = documents.get(queue[i])
        if (current?.kind !== "rooms" || current.building !== building.id || current.floor !== 0) continue
        const sleepingRoom =
          Number(current.bed_capacity ?? 0) > 0 ||
          Number(current.guest_capacity ?? 0) > 0 ||
          ((current.sleeping_places ?? []) as unknown[]).length > 0 ||
          current.furniture?.some((item) => item.role === "bed")
        const restricted = Array.isArray(current.private_for) && !current.private_for.includes(handler)
        if (sleepingRoom || restricted) continue
        if (!current.grid || auditRoomClearance({ ...current, furniture: current.id === room.id ? current.furniture?.filter((f) => used.has(f.symbol)) : [] }).length) continue
        reached.add(current.id)
        for (const connection of (current.connections ?? []) as { kind?: string; target: string }[]) {
          if (!["door", "opening"].includes(connection.kind ?? "door")) continue
          if (connection.target === building.map && documents.get(connection.target)?.kind === "maps") outside = true
          else if (inventory.includes(connection.target) && !reached.has(connection.target) && !queue.includes(connection.target)) queue.push(connection.target)
        }
      }
      if (!outside) fail("Ground storage route needs stairs or a private room, or has no outdoor door")
    }
  }
  return errors
}
