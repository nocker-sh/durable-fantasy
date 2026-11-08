import { restoreSavedPlayer } from "#/world/server/restore-saved-player"
import type { Transition } from "#/world/core/transition"
import type { PlayerRecord } from "#/world/server/player-record"

export function readPlayerInboxReceipt(record: PlayerRecord, id: number): Transition | null {
  return record.exchangeReceipt?.id === id ? { ok: true, state: restoreSavedPlayer(record.player), events: [] } : null
}
