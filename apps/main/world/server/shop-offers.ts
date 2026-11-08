import type { ShopDefinition } from "#/world/core/shop-types"
import { ITEMS } from "#/world/core/items/catalog"
import { qualitiesOf } from "#/world/core/qualities-of"
import { batched } from "#/world/core/batched"
import { nextBatch } from "#/world/core/next-batch"
import { priceNow } from "#/world/core/price-now"
import { stockOf } from "#/world/core/stock-of"
import { stockPrice } from "#/world/core/stock-price"
import type { MarketState } from "#/world/core/market-types"
import { SHOPS } from "#/world/core/shops"
import type { ShopId } from "#/world/core/shop-types"
import type { Offer } from "#/world/server/market-stock"
import { shopMaker } from "#/world/server/shop-maker"
import { currentMarket } from "#/world/server/current-market"

export function shopOffers(state: { market: MarketState }, shop: ShopId, toClose: number | null): Offer[] {
  const now = Date.now()
  const market = currentMarket(state)
  const offers: Offer[] = []
  const definition: ShopDefinition = SHOPS[shop]
  for (const item of definition.stock) {
    const by = ITEMS[item].made ? shopMaker(shop, item) : undefined
    const isBatched = batched(shop, item)
    for (const q of qualitiesOf(item, by)) {
      const left = isBatched ? (market.shelf[shop]?.[item]?.[q] ?? 0) : null
      // a batch that is out comes in some qualities and not others: list only what is there, or the ordinary one as sold out
      if (isBatched && !left && q !== 1) continue
      const price = isBatched ? priceNow({ item: item, q: q, by: by, toClose: toClose, isBatched: true }) : stockPrice({ state: market, shop: shop, item: item, q: q, by: by })
      offers.push({ item, q, price, left: isBatched ? left : Math.floor(stockOf(market, shop, item)), next: isBatched ? nextBatch(shop, item, now) : null })
    }
  }
  return offers
}
