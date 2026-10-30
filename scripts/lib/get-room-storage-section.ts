import { floorLevelsSchema } from "#/scripts/lib/floor-levels-schema"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { StorageRoomSection } from "#/world/town/certify-storage-translation"
import type { Cuboid } from "#/lib/engine/cuboid-subtraction"

/** Unknown furniture heights stay full-height obstacles; the horizontal ceiling does not certify an unmodelled roof or beam. */
export function getRoomStorageSection(room: SettingDocument, building: SettingDocument | undefined, excludedSymbols: readonly string[]): StorageRoomSection | Error {
  const parsed = floorLevelsSchema.safeParse(building?.floor_levels)
  if (!room.grid?.rows.length || building?.kind !== "buildings" || room.building !== building.id || !parsed.success) return new Error("Storage lid has no room section")
  const levels = parsed.data.filter((level) => level.floor === room.floor),
    level = levels[0]
  if (levels.length !== 1 || !level || typeof level.ceiling_elevation_m !== "number") return new Error("Storage lid has no unique checked ceiling")
  const ceiling = level.ceiling_elevation_m - level.elevation_m,
    cell = room.grid.cell_m
  const walls: Cuboid[] = []
  for (const z of room.grid.rows.keys())
    for (const x of [...room.grid.rows[z]].keys()) if (room.grid.rows[z][x] === "#") walls.push({ x0: x * cell, x1: (x + 1) * cell, z0: z * cell, z1: (z + 1) * cell, bottom: 0, top: ceiling })
  const furniture = (room.furniture ?? [])
    .filter((piece) => !excludedSymbols.includes(piece.symbol))
    .map((piece) => ({ x0: piece.rect[0] * cell, x1: (piece.rect[0] + piece.rect[2]) * cell, z0: piece.rect[1] * cell, z1: (piece.rect[1] + piece.rect[3]) * cell, bottom: 0, top: ceiling }))

  return { bounds: { x0: 0, x1: room.grid.rows[0].length * cell, z0: 0, z1: room.grid.rows.length * cell }, ceiling, obstacles: [...walls, ...furniture] }
}
