import { BATCHES } from "#/world/core/market-batches"
import { marketDayStart } from "#/world/core/market-day-start"
import { MARKET_DAY_MS } from "#/world/core/market-rules"
import type { ItemId } from "#/world/core/items/catalog"

/** Return the first production strictly after now, including the following day. */
export function nextBatch(shop: string, item: ItemId, now: number): number | null {
  const batch = BATCHES[shop]?.[item]
  if (!batch) return null

  const day = marketDayStart(now)
  const times = [...batch.at.map((minute) => day + minute * 60_000), ...batch.at.map((minute) => day + MARKET_DAY_MS + minute * 60_000)].filter((time) => time > now)

  return Math.min(...times)
}
