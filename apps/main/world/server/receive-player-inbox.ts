import { receiveInbox } from "#/world/core/receive-inbox"
import { restoreSavedPlayer } from "#/world/server/restore-saved-player"
import { publishPlayer } from "#/world/server/publish-player"
import type { InboxClaim } from "#/world/core/exchange-claim-types"
import type { Transition } from "#/world/core/transition"
import type { PlayerRecord } from "#/world/server/player-record"

export function receivePlayerInbox(record: PlayerRecord, claim: InboxClaim, now: number): Transition {
  if (record.trade?.status === "prepared" && record.exchangeReceipt?.id !== claim.id) return { ok: false, reason: "NOT_READY" }
  const result = receiveInbox({ player: restoreSavedPlayer(record.player), previous: record.exchangeReceipt, claim, now })
  if (!result.ok) return result
  publishPlayer(record, result.state, record.exchangeReceipt?.id !== result.receipt.id)
  record.exchangeReceipt = result.receipt
  return { ok: true, state: record.player, events: result.events }
}
