import { shopBuys } from "#/world/core/shop-buys"
import { ITEMS } from "#/world/core/items/catalog"
import { QUALITY_PRICE } from "#/world/core/items/kinds"
import type { Stack } from "#/world/core/bag-types"
import type { ShopId } from "#/world/core/shop-types"

/** Quality affects made goods after this counter's base payment has been rounded. */
export function sellsFor(shop: ShopId, slot: Stack): number {
  const base = shopBuys(shop, slot.item)
  return ITEMS[slot.item].made ? Math.max(1, Math.floor(base * QUALITY_PRICE[slot.q ?? 1])) : base
}
