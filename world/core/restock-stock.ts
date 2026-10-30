import { hourOfStock } from "#/world/core/hour-of-stock"
import { isItemId } from "#/world/core/items/is-item-id"
import type { MarketState } from "#/world/core/market-types"

/** Retired saved goods remain intact; only current catalogue entries participate in hourly demand. */
export function restockStock(previous: MarketState["stock"], from: number, to: number): NonNullable<MarketState["stock"]> {
  const stock = structuredClone(previous ?? {})
  const lastHour = Math.floor(to / 3_600_000)
  const firstHour = Math.max(Math.floor(from / 3_600_000), lastHour - 48)

  for (const offset of Array.from({ length: Math.max(0, lastHour - firstHour) }, (_value, index) => index + 1)) {
    for (const entry of Object.entries(stock)) {
      for (const item of Object.keys(entry[1])) {
        if (!isItemId(item)) continue
        const quantity = entry[1][item]
        if (quantity !== undefined) entry[1][item] = hourOfStock({ stock: quantity, item, shop: entry[0], hour: firstHour + offset })
      }
    }
  }

  return stock
}
