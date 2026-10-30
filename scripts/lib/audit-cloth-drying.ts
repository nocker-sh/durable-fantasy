import { getClothStorageError } from "#/scripts/lib/get-cloth-storage-error"
import { getClothDryingError } from "#/scripts/lib/get-cloth-drying-error"
import type { SettingDocument } from "#/scripts/lib/setting-document"

/** A room's drying plan must account for cloth hanging beyond its support rails. */
export function auditClothDrying(room: SettingDocument): readonly string[] {
  const errors: string[] = []

  for (const furniture of room.furniture ?? []) {
    if (furniture.cloth_drying === undefined) continue
    if (furniture.role !== "drying_rack" || !room.grid) {
      errors.push(`${room.id}: Cloth drying dimensions need an occupied drying rack`)
      continue
    }
    const error = getClothDryingError(furniture.cloth_drying, furniture.rect[2] * room.grid.cell_m, furniture.rect[3] * room.grid.cell_m)
    const storageError = getClothStorageError(room, furniture.cloth_drying)
    for (const problem of [error, storageError]) if (problem) errors.push(`${room.id}/${furniture.symbol}: ${problem.message}`)
  }

  return errors
}
