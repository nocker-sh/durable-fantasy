import type { Bag, Stack } from "#/world/core/bag-types"
import type { Reason } from "#/world/core/commands"
import type { PlayerState } from "#/world/core/player-types"
import type { Offer } from "#/world/core/trade-types"

export type TradeProposal = {
  id: string
  /** Strictly increasing per participant; stale RPC retries cannot start an old trade again. */
  revision: number
  offer: Offer
  /** The exact offered goods both players confirmed, including wear and maker. */
  outgoing: readonly Stack[]
  incoming: readonly Stack[]
  gold: number
}

export type TradeRecord = {
  proposal: TradeProposal
  status: "prepared" | "committed" | "aborted"
  /** Prepared inventory, never a whole-player snapshot that could overwrite HP or location. */
  inventory: { bag: Bag; gold: number }
}

export type TradeFailure = { ok: false; reason: Reason }
export type PreparedTrade = { ok: true; record: TradeRecord }
export type FinishedTrade = { ok: true; player: PlayerState; record: TradeRecord }
