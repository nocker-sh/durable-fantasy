import { BATCHES } from "#/world/core/market-batches"
import { marketDayStart } from "#/world/core/market-day-start"
import { MARKET_DAY_MS } from "#/world/core/market-rules"
import type { ItemId } from "#/world/core/items/catalog"

type Props = Readonly<{ shop: string; item: ItemId; reservedAt: number; now: number }>

/** Refused goods cannot return after the first production has discarded their reserved batch. */
export function batchReplaced(props: Props): boolean {
  const first = BATCHES[props.shop]?.[props.item]?.at[0]
  if (first === undefined) return false

  const today = marketDayStart(props.now) + first * 60_000

  return (today <= props.now ? today : today - MARKET_DAY_MS) > props.reservedAt
}
