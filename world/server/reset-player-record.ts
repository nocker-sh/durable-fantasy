import { newPlayer } from "#/world/core/new-player"
import { advanceCombatLife } from "#/world/server/advance-combat-life"
import { publishPlayer } from "#/world/server/publish-player"
import type { PlayerState } from "#/world/core/player-types"
import type { PlayerRecord } from "#/world/server/player-record"

export function resetPlayerRecord(record: PlayerRecord): PlayerState {
  if (record.trade?.status === "prepared") throw new Error("Trade is pending")
  advanceCombatLife(record)
  publishPlayer(record, newPlayer())
  record.location = null
  return record.player
}
