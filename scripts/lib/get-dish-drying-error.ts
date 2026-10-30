import { getDishDryingBatches } from "#/scripts/lib/get-dish-drying-batches"
import { getDishDryingBatchLayout } from "#/scripts/lib/get-dish-drying-batch-layout"
import type { dishDryingSchema } from "#/scripts/lib/dish-drying-schema"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { z } from "zod"
type Plan = z.infer<typeof dishDryingSchema>

/** Resolve the occupied support before checking every complete group on the shared measured rack. */
export function getDishDryingError(room: SettingDocument, plan: Plan): Error | null {
  const support = room.furniture?.find((furniture) => furniture.symbol === plan.support),
    basin = room.furniture?.find((furniture) => furniture.symbol === plan.washed_at)
  if (!room.grid || support?.runtime_kind !== "table" || !support.work_surface) return new Error("Dish drying has no measured support table")
  if (basin?.role !== "wash_basin") return new Error("Dish drying has no washing basin")
  const batches = getDishDryingBatches(plan)
  if (batches instanceof Error) return batches
  for (const items of batches) {
    const layout = getDishDryingBatchLayout({ width: support.rect[2] * room.grid.cell_m, depth: support.rect[3] * room.grid.cell_m, plan, items: [...items] })
    if (layout instanceof Error) return layout
  }

  return null
}
