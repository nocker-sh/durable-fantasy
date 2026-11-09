import type { ShopDefinition } from "#/world/core/shop-types"
import type { ItemId } from "#/world/core/items/catalog"
import { batched } from "#/world/core/batched"
import { buyingPrice } from "#/world/core/buying-price"
import { shopRate } from "#/world/core/shop-rate"
import { shopTakes } from "#/world/core/shop-takes"
import { stockOf } from "#/world/core/stock-of"
import type { MarketState } from "#/world/core/market-types"
import { SHOPS } from "#/world/core/shops"
import type { ShopId } from "#/world/core/shop-types"
import { currentMarket } from "#/world/server/current-market"

/**
 * What this shop pays now for one of each carried thing it takes (the rest it refuses), and the stock
 * behind its prices, so the window prices several together with the same functions as the trade.
 */
export function shopBuying(state: { market: MarketState }, shop: ShopId, items: ItemId[]): { buys: Record<string, number>; held: Record<string, number> } {
  currentMarket(state)
  const definition: ShopDefinition = SHOPS[shop]
  const taken = items.filter((item) => shopTakes(shop, item))
  const priced = [...new Set([...taken, ...definition.stock.filter((item) => !batched(shop, item))])]
  return {
    buys: Object.fromEntries(taken.map((item) => [item, buyingPrice({ state: state.market, shop: shop, item: item, rate: shopRate(shop, item) })])),
    held: Object.fromEntries(priced.map((item) => [item, stockOf(state.market, shop, item)])),
  }
}
