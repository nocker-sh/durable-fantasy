import { workSurface } from "#/scripts/lib/work-surface"
import { workTableSections } from "#/world/town/work-table"
import type { personalStorageSchema } from "#/scripts/lib/personal-storage-schema"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { z } from "zod"
type Props = { room: SettingDocument; slot: z.infer<typeof personalStorageSchema>[number] }

/** A dedicated rest belongs to the same resident and contributes its real top and every supporting leg. */
export function getPersonalBoxLidSupport(props: Props) {
  const symbol = props.slot.packing?.opening?.rest_support
  if (symbol === undefined || symbol === null) return null
  const room = props.room,
    furniture = room.furniture?.find((piece) => piece.symbol === symbol),
    box = room.furniture?.find((piece) => piece.symbol === props.slot.furniture_symbol)
  if (!room.grid || furniture?.role !== "lid_support" || furniture.runtime_kind !== "table" || furniture.runtime_solid !== true || furniture.owner !== box?.owner)
    return new Error("Lid rest has no matching dedicated support furniture")
  try {
    const rect = furniture.rect,
      cell = room.grid.cell_m,
      width = rect[2] * cell,
      depth = rect[3] * cell,
      surface = workSurface(furniture.work_surface, width, depth)
    const parts = workTableSections({ surface: surface, x: (rect[0] + rect[2] / 2) * cell, z: (rect[1] + rect[3] / 2) * cell, width: width, depth: depth })
    const obstacles = parts.map((part) => ({ x0: part.x0, x1: part.x1, z0: part.z0, z1: part.z1, bottom: part.y0, top: part.y1 }))
    return { symbol, top: obstacles[0], parts, obstacles }
  } catch (error) {
    if (error instanceof Error) return error
    return new Error("Invalid lid rest furniture")
  }
}
