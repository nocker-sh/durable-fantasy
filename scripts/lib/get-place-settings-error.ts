import { getBoxLayoutError } from "#/lib/engine/get-box-layout-error"
import { getTablewareInventory } from "#/scripts/lib/get-tableware-inventory"
import { getPlaceSettingBoxes } from "#/scripts/lib/get-place-setting-boxes"
import { workSurface } from "#/scripts/lib/work-surface"
import type { tablePlaceSettingsSchema } from "#/scripts/lib/table-place-settings-schema"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { z } from "zod"
type Plan = z.infer<typeof tablePlaceSettingsSchema>

/** Use the kitchen's single measured inventory to check the real tabletop's occupied bounds. */
export function getPlaceSettingsError(room: SettingDocument, plan: Plan, documents: ReadonlyMap<string, SettingDocument>): Error | null {
  const inventory = getTablewareInventory(room, plan, documents)
  if (inventory instanceof Error) return inventory
  const boxes = getPlaceSettingBoxes({ inventory, plan, documents })
  if (boxes instanceof Error) return boxes
  const table = room.furniture?.find((furniture) => furniture.symbol === plan.table)
  if (!room.grid || table?.role !== "table" || table.runtime_kind !== "table") return new Error("Tabletop settings have no measured dining table")
  const width = table.rect[2] * room.grid.cell_m,
    depth = table.rect[3] * room.grid.cell_m
  try {
    workSurface(table.work_surface, width, depth)
  } catch (error) {
    if (error instanceof Error) return error
    return new Error("Invalid dining table dimensions")
  }
  const height = boxes.reduce((maximum, box) => Math.max(maximum, box.size[1]), 0)

  return getBoxLayoutError({ size: [width, height, depth], boxes, gap: plan.min_gap_m })
}
