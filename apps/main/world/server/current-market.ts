import { restoreMarket } from "#/world/server/restore-market"
import { emptyMarket } from "#/world/core/empty-market"
import { restock } from "#/world/core/restock"
import { seedStock } from "#/world/core/seed-stock"
import type { MarketState } from "#/world/core/market-types"
import { SHOPS } from "#/world/core/shops"
import { shopMaker } from "#/world/server/shop-maker"

/** The shelves now; a market that has just opened starts as if it had been running all day. */
export function currentMarket(state: { market: MarketState }): MarketState {
  restoreMarket(state.market)
  const now = Date.now()
  if (state.market.since === undefined) state.market = { ...emptyMarket(now - 86_400_000), since: now }
  if (!state.market.stock) state.market = { ...state.market, stock: seedStock(SHOPS) }
  state.market = restock(state.market, now, shopMaker)
  return state.market
}
