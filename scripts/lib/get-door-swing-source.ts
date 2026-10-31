import { z } from "zod"
import { roomGridSchema, roomOriginSchema } from "#/scripts/lib/room-layout-schema"
import { roomConnectionSchema } from "#/scripts/lib/room-connection-schema"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { Leaf } from "#/scripts/lib/door-swing"

// Rectangular coverage belongs to the room audit; local collision diagnostics still inspect available rows.
const gridSchema = z.object(roomGridSchema.shape)
const connectionsSchema = z.array(roomConnectionSchema.pick({ kind: true, door: true, width_cells: true })).nullish()

/** Mechanical geometry needs one unambiguous doorway; destination routing is audited separately. */
export function getDoorSwingSource(document: SettingDocument, leaf: Leaf) {
  const grid = gridSchema.safeParse(document.grid),
    door = roomOriginSchema.safeParse(leaf.door),
    connections = connectionsSchema.safeParse(document.connections)
  if (!grid.success || !door.success || !connections.success) return undefined
  const x = door.data[0],
    y = door.data[1],
    rows = grid.data.rows
  const matching = connections.data?.filter((connection) => (connection.kind ?? "door") === "door" && connection.door?.[0] === x && connection.door?.[1] === y) ?? []
  if (matching.length !== 1 || x < 0 || y < 0 || x >= rows[0].length || y >= rows.length) return undefined
  const horizontal = y === 0 || y === rows.length - 1,
    width = matching[0].width_cells ?? 1
  if ((!horizontal && x !== 0 && x !== rows[0].length - 1) || !Number.isSafeInteger(width) || width < 1 || width > (horizontal ? rows[0].length - x : rows.length - y)) return undefined
  return { rows, scale: grid.data.cell_m, x, y, horizontal, width }
}
