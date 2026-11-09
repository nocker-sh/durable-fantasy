import { shopBuys } from "#/world/core/shop-buys"
import { buybackOf } from "#/world/core/buyback-of"
import type { Stack } from "#/world/core/bag-types"
import type { ShopId } from "#/world/core/shop-types"

/** What this counter pays for one of the stack at its usual stock, after quality and a tool's wear. */
export function sellsFor(shop: ShopId, slot: Stack): number {
  return buybackOf(shopBuys(shop, slot.item), slot)
}
