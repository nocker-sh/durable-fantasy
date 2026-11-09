import { shopRate } from "#/world/core/shop-rate"
import { target } from "#/world/core/target"
import { unitBuyingPrice } from "#/world/core/unit-buying-price"
import type { ItemId } from "#/world/core/items/catalog"
import type { ShopId } from "#/world/core/shop-types"

/** What this counter pays for one at its usual stock, with its capped preference for the kind. */
export function shopBuys(shop: ShopId, item: ItemId): number {
  return unitBuyingPrice({ item, stock: target(item), rate: shopRate(shop, item) })
}
