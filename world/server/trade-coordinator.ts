import type { prepareTrade } from "#/world/core/prepare-trade"
import type { TradeProposal, TradeRecord } from "#/world/core/trade-transaction-types"
import type { PlayerState } from "#/world/core/player-types"
import type { Transition } from "#/world/core/transition"
import type { Reason } from "#/world/core/commands"

export type TradeJob = {
  peer: string
  local: TradeProposal
  remote: TradeProposal
  decision: "committed" | "aborted" | null
  finished: boolean
  reason: Reason | null
}

export type TradeParticipant = {
  player: PlayerState
  trade: TradeRecord | null
  tradeJob: TradeJob | null
}

export type TradePeer = {
  prepareTrade(proposal: TradeProposal): Promise<ReturnType<typeof prepareTrade>>
  finishTrade(input: { id: string; revision: number; decision: "committed" | "aborted" }): Promise<Transition>
  tradeStatus(): Promise<TradeRecord | null>
}
