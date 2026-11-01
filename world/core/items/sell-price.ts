import { buybackRate } from "#/world/core/buyback-rate"
import { ITEMS } from "#/world/core/items/catalog"
import type { ItemId } from "#/world/core/items/catalog"
/** The usual buy-back for one, at a shop's usual stock and without a counter's preference (a shop's own price is unitBuyingPrice). */
export function sellPrice(id: ItemId): number {
  return Math.max(1, Math.floor(ITEMS[id].price * buybackRate(id)))
}
