import { waterStockCycleSchema } from "#/world/town/water-stock-cycle-schema"
import { advanceWaterStock } from "#/world/town/advance-water-stock"

/** A balanced daily total is insufficient: every withdrawal must fit the stock available before the next refill. */
export function getWaterStockCycle(input: unknown) {
  const parsed = waterStockCycleSchema.safeParse(input)
  if (!parsed.success) return new Error("Invalid proposed water stock cycle")
  const plan = parsed.data
  if (plan.initial_ml > plan.capacity_ml) return new Error("Opening water stock exceeds working capacity")

  const stock = { current: { value: plan.initial_ml, minimum: plan.initial_ml, maximum: plan.initial_ml, received: 0, used: 0, minute: -1 } }
  for (const event of plan.events) {
    const next = advanceWaterStock({ stock: stock.current, event, capacityMl: plan.capacity_ml, firstMinute: plan.events[0].at_min })
    if (next instanceof Error) return next
    stock.current = next
  }
  if (stock.current.value !== plan.initial_ml) return new Error("Water cycle does not preserve the next day's opening stock")

  return {
    initialMl: plan.initial_ml,
    finalMl: stock.current.value,
    minimumMl: stock.current.minimum,
    maximumMl: stock.current.maximum,
    receivedMl: stock.current.received,
    usedMl: stock.current.used,
  }
}
