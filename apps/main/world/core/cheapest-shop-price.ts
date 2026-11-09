import { SHOPS } from "#/world/core/shops"
import { ITEMS } from "#/world/core/items/catalog"
import { batched } from "#/world/core/batched"
import { friendPrice } from "#/world/core/friend-price"
import { makerAt } from "#/world/core/maker-at"
import { priceNow } from "#/world/core/price-now"
import { priceOf } from "#/world/core/price-of"
import { qualitiesOf } from "#/world/core/qualities-of"
import { stockFactor } from "#/world/core/stock-factor"
import type { ItemId } from "#/world/core/items/catalog"
import type { ShopId } from "#/world/core/shop-types"

/** The friendship at which the discount reaches its cap (friend-discount.ts). */
const CLOSEST = 100

/**
 * The least any shop can ever ask for one: the cheapest quality it carries, at its fullest stock or
 * just before it closes, with the most a friend is let off. Null when no shop sells it.
 */
export function cheapestShopPrice(item: ItemId): number | null {
  const prices = (Object.keys(SHOPS) as ShopId[])
    .filter((shop) => (SHOPS[shop].stock as readonly ItemId[]).includes(item))
    .flatMap((shop) => {
      const by = ITEMS[item].made ? makerAt(shop, item) : undefined
      return qualitiesOf(item, by).map((q) => {
        const asked = batched(shop, item) ? priceNow({ item, q, by, toClose: 0, isBatched: true }) : Math.max(1, Math.round(priceOf(item, q, by) * stockFactor(Number.MAX_SAFE_INTEGER, item)))
        return friendPrice(asked, CLOSEST)
      })
    })
  return prices.length ? Math.min(...prices) : null
}
