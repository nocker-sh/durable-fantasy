import { roomDoorPortalSchema } from "#/scripts/lib/building-door-inventory-schema"
import type { SettingDocument } from "#/scripts/lib/setting-document"

/** Compare shared doorways in building coordinates; opposite inward directions still identify one physical aperture. */
export function getRoomDoorPortals(document: SettingDocument) {
  const parsed = roomDoorPortalSchema.safeParse(document)
  if (!parsed.success) return new Error("Door inventory requires authored room origins and grid")
  const room = parsed.data,
    records: { key: string; room: string; door: readonly [number, number]; leafCount: number; width: number }[] = []
  for (const connection of room.connections) {
    if (connection.kind !== undefined && connection.kind !== "door") continue
    const door = connection.door
    if (!door) return new Error("Door inventory has no doorway coordinate")
    const horizontal = door[1] === 0 || door[1] === room.grid.rows.length - 1,
      width = connection.width_cells ?? 1,
      x = room.origin[0] + door[0],
      y = room.origin[1] + door[1]
    const end = (horizontal ? door[0] : door[1]) + width,
      limit = horizontal ? room.grid.rows[0].length : room.grid.rows.length
    if (
      door[0] >= room.grid.rows[0].length ||
      door[1] >= room.grid.rows.length ||
      end > limit ||
      (!horizontal && door[0] !== 0 && door[0] !== room.grid.rows[0].length - 1) ||
      ![x, y].every(Number.isSafeInteger)
    )
      return new Error("Door inventory has no bounded boundary portal")
    const key = `${room.floor}:${horizontal ? "h" : "v"}:${x},${y}:${width}`,
      leafCount = room.door_leaves?.filter((leaf) => leaf.door[0] === door[0] && leaf.door[1] === door[1]).length ?? 0
    records.push({ key, room: document.id, door, leafCount, width })
  }
  if (room.door_leaves?.some((leaf) => !records.some((record) => record.door[0] === leaf.door[0] && record.door[1] === leaf.door[1]))) return new Error("Door leaf has no matching room portal")

  return records
}
