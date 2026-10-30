import { SHOPS } from "#/world/core/shops"
import { isShopId } from "#/world/core/is-shop-id"
import type { ShopDefinition, ShopId } from "#/world/core/shop-types"

/** Prefer an open counter among several pitches, retaining the first authored shop when none is open. */
export function shopOfKeeper(name: string, open?: (shop: ShopId) => boolean): ShopId | null {
  if (open)
    for (const id of Object.keys(SHOPS).filter(isShopId)) {
      const shop: ShopDefinition = SHOPS[id]
      if (shop.keepers.includes(name) && open(id)) return id
    }
  for (const id of Object.keys(SHOPS).filter(isShopId)) {
    const shop: ShopDefinition = SHOPS[id]
    if (shop.keepers.includes(name)) return id
  }
  return null
}
