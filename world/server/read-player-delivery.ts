import { restoreSavedPlayer } from "#/world/server/restore-saved-player"
import type { PlayerRecord } from "#/world/server/player-record"

export function readPlayerDelivery(record: PlayerRecord, after: number | null) {
  const player = restoreSavedPlayer(record.player)
  return { revision: record.deliveryRevision, player: after === record.deliveryRevision ? null : player }
}
