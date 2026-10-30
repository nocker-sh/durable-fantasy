import { getBoxLayoutError } from "#/lib/engine/get-box-layout-error"
import { shelfDimensions } from "#/scripts/lib/shelf-dimensions"
import { storageBoxInterior } from "#/world/town/storage-box-interior"
import type { dishDryingSchema } from "#/scripts/lib/dish-drying-schema"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { z } from "zod"
type Plan = z.infer<typeof dishDryingSchema>

/** Pack solid outer bounds without assuming bowls nest or counting box walls as capacity. */
export function getDishStorageError(room: SettingDocument, plan: Plan): Error | null {
  const cabinet = room.furniture?.find((furniture) => furniture.symbol === plan.dry_storage)
  if (!cabinet || !room.grid) return new Error("Drying dishes have no storage shelf")

  if (plan.items.some((item) => item.storage.position_m[1] !== 0)) return new Error("Stored dish has no floor contact")

  try {
    const shelf = shelfDimensions(cabinet.shelf, cabinet.rect[2] * room.grid.cell_m, cabinet.rect[3] * room.grid.cell_m)
    for (const id of new Set(plan.items.map((item) => item.storage.box))) {
      const box = shelf.items?.find((item) => item.id === id)
      if (box?.kind !== "box") return new Error(`Drying dishes have no storage box ${id}`)
      const interior = storageBoxInterior(box)
      const boxes = plan.items
        .filter((item) => item.storage.box === id)
        .map((item) => ({ id: item.id, origin: item.storage.position_m, size: [item.width_m, item.height_m, item.depth_m] satisfies [number, number, number] }))
      const error = getBoxLayoutError({ size: [interior.width, interior.height, interior.depth], boxes, gap: 0 })
      if (error) return error
    }
  } catch (error) {
    if (error instanceof Error) return error
    return new Error("Invalid dish storage")
  }

  return null
}
