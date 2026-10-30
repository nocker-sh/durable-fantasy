import type { MarketState } from "#/world/core/market-types"
import type { ShopCommand, ShopQuote } from "#/world/core/shop-receipt-types"

export type ShopJob = {
  id: number
  connection: string
  seq: number
  command: ShopCommand
  quote: ShopQuote
  at: number
  phase: "pending" | "done"
}
export type MarketRecord = {
  market: MarketState
  serial: number
  jobs: Record<string, ShopJob>
}
