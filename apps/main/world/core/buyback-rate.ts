import { ITEMS } from "#/world/core/items/catalog"
import { BUYBACK_RATE, MADE_BUYBACK_RATE } from "#/world/core/market-rules"
import type { ItemId } from "#/world/core/items/catalog"

/** The share of the list price a shop pays at its usual stock: less for made things than for plain ones. */
export function buybackRate(item: ItemId): number {
  return ITEMS[item].made ? MADE_BUYBACK_RATE : BUYBACK_RATE
}
