import { workSurface } from "#/scripts/lib/work-surface"
import { dishDryingSchema } from "#/scripts/lib/dish-drying-schema"
import { getCupDefinition } from "#/scripts/lib/get-cup-definition"
import { getBoxLayoutError } from "#/lib/engine/get-box-layout-error"
import type { LayoutBox } from "#/lib/engine/get-box-layout-error"
import type { hotWaterServiceSchema } from "#/scripts/lib/hot-water-service-schema"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { z } from "zod"
type Props = { room: SettingDocument; plan: z.infer<typeof hotWaterServiceSchema> }

/** Check the registered cups including handles on a cleared surface; this does not certify pouring or hot-object contact. */
export function getHotWaterCupLayout(props: Props) {
  const station = props.plan.serving,
    table = props.room.furniture?.find((part) => part.symbol === station.table),
    dishes = dishDryingSchema.safeParse(props.room.dish_drying)
  if (!props.room.grid || !dishes.success || table?.runtime_kind !== "table" || !table.work_surface || !table.use_space?.[station.space_index])
    return new Error("Hot-water cups have no measured work table and operating space")
  const ids = station.cups.map((cup) => cup.cup),
    portions = props.plan.portions.map((portion) => portion.cup),
    boxes: LayoutBox[] = []
  if (new Set(portions).size !== portions.length || new Set(ids).size !== ids.length || ids.length !== portions.length || portions.some((id) => !ids.includes(id)))
    return new Error("Cup station does not match each water allocation exactly once")
  for (const placed of station.cups) {
    const item = dishes.data.items.find((dish) => dish.id === placed.cup)
    if (!item) return new Error("Cup station has no registered object")
    const cup = getCupDefinition(item)
    if (cup instanceof Error) return cup
    boxes.push({ id: item.id, origin: [placed.position_m[0], 0, placed.position_m[1]], size: [cup.width, cup.height, cup.depth] })
  }
  const width = table.rect[2] * props.room.grid.cell_m,
    depth = table.rect[3] * props.room.grid.cell_m,
    height = Math.max(...boxes.map((box) => box.size[1])),
    error = getBoxLayoutError({
      size: [width - 2 * station.edge_margin_m, height, depth - 2 * station.edge_margin_m],
      boxes: boxes.map((box) => ({ ...box, origin: [box.origin[0] - station.edge_margin_m, 0, box.origin[2] - station.edge_margin_m] })),
      gap: station.min_gap_m,
    })
  if (error) return error
  try {
    workSurface(table.work_surface, width, depth)
  } catch (failure) {
    return failure instanceof Error ? failure : new Error("Invalid cup support table")
  }

  return { table, boxes }
}
