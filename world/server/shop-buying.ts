import type { ShopDefinition } from "#/world/core/shop-types"
import { ITEMS } from "#/world/core/items/catalog"
import type { ItemId } from "#/world/core/items/catalog"
import { buyingPrice } from "#/world/core/buying-price"
import type { MarketState } from "#/world/core/market-types"
import { SHOPS } from "#/world/core/shops"
import type { ShopId } from "#/world/core/shop-types"
import { currentMarket } from "#/world/server/current-market"

export function shopBuying(state: { market: MarketState }, shop: ShopId, items: ItemId[]): Record<string, number> {
  currentMarket(state)
  const definition: ShopDefinition = SHOPS[shop]
  const rates = definition.rates ?? {}
  return Object.fromEntries(items.map((item) => [item, buyingPrice({ state: state.market, shop: shop, item: item, rate: rates[ITEMS[item].kind] ?? 1 })]))
}
