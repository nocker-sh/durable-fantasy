import { prepareTrade } from "#/world/core/prepare-trade"
import { restoreSavedPlayer } from "#/world/server/restore-saved-player"
import type { TradeProposal } from "#/world/core/trade-transaction-types"
import type { PlayerRecord } from "#/world/server/player-record"

export function preparePlayerTrade(record: PlayerRecord, proposal: TradeProposal, now: number): ReturnType<typeof prepareTrade> {
  const result = prepareTrade({ player: restoreSavedPlayer(record.player), previous: record.trade, proposal, now })
  if (result.ok) record.trade = result.record
  return result
}
