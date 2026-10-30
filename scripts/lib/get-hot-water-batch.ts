import { dishDryingSchema } from "#/scripts/lib/dish-drying-schema"
import { potableWaterSupplySchema } from "#/scripts/lib/potable-water-supply-schema"
import { getCupDefinition } from "#/scripts/lib/get-cup-definition"
import { createWaterStock } from "#/world/core/create-water-stock"
import { prepareWaterBatch } from "#/world/core/prepare-water-batch"
import type { WaterAllocation } from "#/world/core/water-batch-types"
import type { hotWaterServiceSchema } from "#/scripts/lib/hot-water-service-schema"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { z } from "zod"
type Props = { room: SettingDocument; plan: z.infer<typeof hotWaterServiceSchema> }

/** This tests a possible batch against a filled home stock; it does not assert the current stock or a daily supply. */
export function getHotWaterBatch(props: Props) {
  const supply = potableWaterSupplySchema.safeParse(props.room.potable_water_supply),
    dishes = dishDryingSchema.safeParse(props.room.dish_drying)
  if (!supply.success || !dishes.success || props.plan.filled_from !== supply.data.container_symbol) return new Error("Hot water has no matching potable supply and cups")
  const limit = supply.data.max_fill_l * 1000,
    stock = createWaterStock(limit, limit),
    allocations: WaterAllocation[] = []
  if (stock instanceof Error) return stock
  for (const portion of props.plan.portions) {
    const item = dishes.data.items.find((dish) => dish.id === portion.cup)
    if (!item || item.kind !== "cup" || !Array.isArray(props.room.occupants) || !props.room.occupants.includes(item.owner)) return new Error("Hot-water portion has no registered cup")
    const cup = getCupDefinition(item)
    if (cup instanceof Error) return cup
    allocations.push({ id: item.id, amountMl: portion.amount_ml, capacityMl: Math.floor(cup.bowl.capacity * 1e6) })
  }

  return prepareWaterBatch({ stock, amountMl: props.plan.fill_ml, allocations })
}
