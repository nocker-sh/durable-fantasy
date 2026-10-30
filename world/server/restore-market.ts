import { isMarketState } from "#/world/server/is-market-state"
import type { MarketState } from "#/world/core/market-types"

/** Keep the validated original, including retired goods, metadata and fractional stock. */
export function restoreMarket(saved: unknown): MarketState {
  if (!isMarketState(saved)) throw new Error("Saved market data is unreadable")

  return saved
}
