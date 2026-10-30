import { getTablewareInventory } from "#/scripts/lib/get-tableware-inventory"
import { getPlaceSettingBoxes } from "#/scripts/lib/get-place-setting-boxes"
import { getDiningSeatGeometry } from "#/scripts/lib/get-dining-seat-geometry"
import { getDinerTableReachError } from "#/scripts/lib/get-diner-table-reach-error"
import { RESIDENTS, RESIDENT_LOOKS } from "#/world/town/residents"
import type { tablePlaceSettingsSchema } from "#/scripts/lib/table-place-settings-schema"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { z } from "zod"
type Plan = z.infer<typeof tablePlaceSettingsSchema>

/** Resolve actual diners, chair offsets and rotated objects before testing native seated reach. */
export function getPlaceReachError(room: SettingDocument, plan: Plan, documents: ReadonlyMap<string, SettingDocument>): Error | null {
  if (!plan.places.some((place) => place.reach_review !== undefined)) return null
  const inventory = getTablewareInventory(room, plan, documents)
  if (inventory instanceof Error) return inventory
  const boxes = getPlaceSettingBoxes({ inventory, plan, documents })
  if (boxes instanceof Error) return boxes
  const table = room.furniture?.find((furniture) => furniture.symbol === plan.table)
  if (!room.grid || !table) return new Error("Dining reach has no room or table")
  for (const place of plan.places) {
    if (!place.reach_review) continue
    const diner = documents.get(place.resident),
      chair = room.furniture?.find((furniture) => furniture.symbol === place.chair)
    const look = RESIDENT_LOOKS[RESIDENTS.findIndex((resident) => resident.name === diner?.title)]
    if (diner?.kind !== "residents" || !look || !chair) return new Error("Dining reach has no diner or chair")
    const geometry = getDiningSeatGeometry({ chair, table, cell: room.grid.cell_m })
    if (geometry instanceof Error) return geometry
    const error = getDinerTableReachError({ look, place, geometry, boxes, origin: [table.rect[0] * room.grid.cell_m, table.rect[1] * room.grid.cell_m] })
    if (error) return error
  }

  return null
}
