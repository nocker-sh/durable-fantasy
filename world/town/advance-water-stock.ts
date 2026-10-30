import { RESIDENT_DAY_MINUTES } from "#/world/town/resident-day-plan-schema"
import type { WaterStockEvent, WaterStockPosition } from "#/world/town/water-stock-cycle-types"

type Props = Readonly<{ stock: WaterStockPosition; event: WaterStockEvent; capacityMl: number; firstMinute: number }>

/** Advance one owned account in strict periodic order, without borrowing future receipts or rounding water away. */
export function advanceWaterStock(props: Props): WaterStockPosition | Error {
  if (props.event.at_min <= props.stock.minute || (props.event.at_min === RESIDENT_DAY_MINUTES && props.firstMinute === 0)) return new Error("Water reservations have no strict chronological order")

  const value = props.event.kind === "receive" ? props.stock.value + props.event.volume_ml : props.stock.value - props.event.volume_ml
  const received = props.stock.received + (props.event.kind === "receive" ? props.event.volume_ml : 0)
  const used = props.stock.used + (props.event.kind === "use" ? props.event.volume_ml : 0)
  if (![value, received, used].every(Number.isSafeInteger)) return new Error("Unbounded water stock arithmetic")
  if (value < 0) return new Error("Water is reserved before enough stock is available")
  if (value > props.capacityMl) return new Error("Water refill exceeds working capacity")

  return { value, minimum: Math.min(props.stock.minimum, value), maximum: Math.max(props.stock.maximum, value), received, used, minute: props.event.at_min }
}
