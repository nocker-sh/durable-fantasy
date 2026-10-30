import { clothDryingSchema } from "#/scripts/lib/cloth-drying-schema"
import { shelfDimensions } from "#/scripts/lib/shelf-dimensions"
import type { SettingDocument } from "#/scripts/lib/setting-document"

/** Store every cloth as a separate folded pair of layers, not as one cloth shared across rails. */
export function getClothStorageError(room: SettingDocument, value: unknown): Error | null {
  const parsed = clothDryingSchema.safeParse(value)
  if (!parsed.success || !room.grid) return new Error("Invalid cloth drying storage")
  const cloth = parsed.data
  const cabinet = room.furniture?.find((furniture) => furniture.symbol === cloth.storage.furniture)
  if (!cabinet) return new Error("Drying cloth has no storage shelf")

  try {
    const shelf = shelfDimensions(cabinet.shelf, cabinet.rect[2] * room.grid.cell_m, cabinet.rect[3] * room.grid.cell_m)
    const stored = shelf.items?.find((item) => item.id === cloth.storage.item)
    if (stored?.kind !== "linen") return new Error("Drying cloth has no matching stored linen")
    if (stored.width < cloth.clothWidth || stored.depth < cloth.clothLength / 2 || stored.height < cloth.clothThickness * 2 * cloth.rails.length)
      return new Error("Stored linen cannot contain every folded drying cloth")
  } catch (error) {
    if (error instanceof Error) return error
    return new Error("Invalid cloth drying storage")
  }

  return null
}
