import { finishTrade } from "#/world/core/finish-trade"
import { restoreSavedPlayer } from "#/world/server/restore-saved-player"
import { publishPlayer } from "#/world/server/publish-player"
import type { Transition } from "#/world/core/transition"
import type { PlayerRecord } from "#/world/server/player-record"
import type { PlayerTradeDecision } from "#/world/server/player-operation-types"

/** The enclosing durable operation persists both fields, including retries of a final decision. */
export function finishPlayerTrade(record: PlayerRecord, input: PlayerTradeDecision): Transition {
  const result = finishTrade({ player: restoreSavedPlayer(record.player), record: record.trade, id: input.id, revision: input.revision, decision: input.decision })
  if (!result.ok) return result
  publishPlayer(record, result.player)
  record.trade = result.record
  return { ok: true, state: record.player, events: [] }
}
