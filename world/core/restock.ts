import { getMarketHappenings } from "#/world/core/get-market-happenings"
import { applyMarketHappening } from "#/world/core/apply-market-happening"
import { restockStock } from "#/world/core/restock-stock"
import type { ItemId } from "#/world/core/items/catalog"
import type { MarketState, Shelf } from "#/world/core/market-types"

/** Advance prepared shelves and ordinary stock together without modifying the saved input. */
export function restock(state: MarketState, now: number, makerOf: (shop: string, item: ItemId) => string): MarketState {
  if (now <= state.at) return state

  const shelf: Shelf = structuredClone(state.shelf)
  for (const happening of getMarketHappenings(state.at, now)) applyMarketHappening({ shelf, happening, makerOf })
  const stock = restockStock(state.stock, state.at, now)

  return { ...state, shelf, stock, at: now }
}
