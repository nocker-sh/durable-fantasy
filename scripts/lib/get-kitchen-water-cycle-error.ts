import { getKitchenWaterPlanReview } from "#/scripts/lib/get-kitchen-water-plan-review"
import { getDishwaterCaptureError } from "#/scripts/lib/get-dishwater-capture-error"
import { getKitchenWaterBindingsError } from "#/scripts/lib/get-kitchen-water-bindings-error"
import { getFurnitureLiquidCapacity } from "#/scripts/lib/get-furniture-liquid-capacity"
import { getWaterStockCycle } from "#/world/town/get-water-stock-cycle"
import type { SettingDocument } from "#/scripts/lib/setting-document"
type Props = Readonly<{ room: SettingDocument; documents: ReadonlyMap<string, SettingDocument> }>

/** Only the authored kitchen account cycles; source capacity, carrying, whole-house demand and water quality remain unresolved. */
export function getKitchenWaterCycleError(props: Props): Error | null {
  if (props.room.kitchen_water_cycle === undefined) return null
  const review = getKitchenWaterPlanReview(props)
  if (review instanceof Error) return review
  const plan = review.plan
  const dishwaterError = getDishwaterCaptureError(props)
  if (dishwaterError) return dishwaterError
  const capacity = getFurnitureLiquidCapacity({ room: props.room, symbol: plan.fresh_symbol, role: "potable_water_storage", vessel: plan.vessel })
  if (capacity instanceof Error) return capacity
  const bindingsError = getKitchenWaterBindingsError({ plan, day: review.day, roomId: props.room.id, capture: review.capture })
  if (bindingsError) return bindingsError
  const stock = getWaterStockCycle({ initial_ml: plan.initial_ml, capacity_ml: capacity.capacityMl, events: plan.events })
  if (stock instanceof Error) return stock

  return null
}
