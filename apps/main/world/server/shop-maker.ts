import { makerAt } from "#/world/core/maker-at"
import { isShopId } from "#/world/core/is-shop-id"
import type { ItemId } from "#/world/core/items/catalog"

/** Restocking supplies shop names; validate that boundary before using the typed maker lookup. */
export function shopMaker(shop: string, item: ItemId) {
  if (!isShopId(shop)) throw new TypeError("Unknown shop")
  return makerAt(shop, item)
}
