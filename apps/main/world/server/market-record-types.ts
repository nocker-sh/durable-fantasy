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
  /** when it was first seen settled (prune-finished-jobs.ts) */
  doneAt?: number
}
export type MarketRecord = {
  market: MarketState
  serial: number
  jobs: Record<string, ShopJob>
}
