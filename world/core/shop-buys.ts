import { SHOPS } from "#/world/core/shops"
import { ITEMS } from "#/world/core/items/catalog"
import { sellPrice } from "#/world/core/items/sell-price"
import type { ItemId } from "#/world/core/items/catalog"
import type { ShopDefinition, ShopId } from "#/world/core/shop-types"

/** Apply this counter's preferred item kinds, rounding down while keeping the existing minimum payment. */
export function shopBuys(shop: ShopId, item: ItemId): number {
  const definition: ShopDefinition = SHOPS[shop]
  const rate = definition.rates?.[ITEMS[item].kind] ?? 1
  return Math.max(1, Math.floor(sellPrice(item) * rate))
}
