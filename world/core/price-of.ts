import { ITEMS } from "#/world/core/items/catalog"
import { QUALITY_PRICE } from "#/world/core/items/kinds"
import type { ItemId } from "#/world/core/items/catalog"
import type { Quality } from "#/world/core/items/kinds"
import { traitOf } from "#/world/core/trait-of"

/** What one costs in a shop, by its quality and maker. */
export function priceOf(item: ItemId, q: Quality = 1, by?: string): number {
  const base = ITEMS[item].price
  if (!ITEMS[item].made) return base
  return Math.max(1, Math.round(base * QUALITY_PRICE[q] * (traitOf(item, by)?.price ?? 1)))
}
