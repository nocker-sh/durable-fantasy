import type { MarketState } from "#/world/core/market-types"
export function emptyMarket(at: number): MarketState {
  return { shelf: {}, at }
}
