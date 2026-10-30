import { target } from "#/world/core/target"
import type { ItemId } from "#/world/core/items/catalog"
import type { MarketState } from "#/world/core/market-types"
/** An unseeded kept item retains the original target-stock fallback. */
export function stockOf(state: MarketState, shop: string, item: ItemId) {
  return state.stock?.[shop]?.[item] ?? target(item)
}
