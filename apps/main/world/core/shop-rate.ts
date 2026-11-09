import { ITEMS } from "#/world/core/items/catalog"
import { SHOPS } from "#/world/core/shops"
import { MAX_SHOP_RATE } from "#/world/core/market-rules"
import type { ItemId } from "#/world/core/items/catalog"
import type { ShopDefinition, ShopId } from "#/world/core/shop-types"

/** This counter's preference for the item's kind, capped so a shop never pays half of what it asks. */
export function shopRate(shop: ShopId, item: ItemId): number {
  const definition: ShopDefinition = SHOPS[shop]
  return Math.min(MAX_SHOP_RATE, definition.rates?.[ITEMS[item].kind] ?? 1)
}
