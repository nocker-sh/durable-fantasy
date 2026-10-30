import { settle } from "#/world/core/settle"
import type { PlayerState } from "#/world/core/player-types"
import { derive } from "#/world/core/derive"
import type { PlayerRecord } from "#/world/server/player-record"
import { restoreSavedPlayer } from "#/world/server/restore-saved-player"
import { publishPlayer } from "#/world/server/publish-player"

export function readPlayerRecord(record: Pick<PlayerRecord, "player" | "deliveryRevision">, now: number): PlayerState {
  const player = restoreSavedPlayer(record.player)
  publishPlayer(record, settle(player, derive(player), now), false)
  return record.player
}
