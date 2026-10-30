import { BATCHES } from "#/world/core/market-batches"
import { marketDayStart } from "#/world/core/market-day-start"
import { MARKET_DAY_MS } from "#/world/core/market-rules"
import { isItemId } from "#/world/core/items/is-item-id"
import { getBatchHappenings } from "#/world/core/get-batch-happenings"
import type { Happening } from "#/world/core/market-types"

/** Stale shelves require at most the last day's events, sorted stably across shops and goods. */
export function getMarketHappenings(from: number, to: number): Happening[] {
  if (to <= from) return []
  const start = Math.max(from, to - MARKET_DAY_MS)
  const firstDay = marketDayStart(start)
  const happenings: Happening[] = []

  for (const day of [firstDay, firstDay + MARKET_DAY_MS]) {
    if (day > to) continue
    for (const shop of Object.entries(BATCHES)) {
      for (const item of Object.entries(shop[1])) {
        if (!isItemId(item[0])) throw new Error("Unknown batch item")
        if (item[1]) happenings.push(...getBatchHappenings({ day, start, to, shop: shop[0], item: item[0], batch: item[1] }))
      }
    }
  }

  return happenings.sort((first, second) => first.t - second.t)
}
