import { SHOPS } from "#/world/core/shops"
import type { ShopId } from "#/world/core/shop-types"
export function isShopId(value: string): value is ShopId {
  return Object.hasOwn(SHOPS, value)
}
