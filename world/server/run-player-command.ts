import { apply } from "#/world/core/apply"
import { restoreSavedPlayer } from "#/world/server/restore-saved-player"
import { publishPlayer } from "#/world/server/publish-player"
import { advanceCombatLife } from "#/world/server/advance-combat-life"
import { freezePlayerLocation } from "#/world/server/freeze-player-location"
import type { Transition } from "#/world/core/transition"
import type { PlayerRecord } from "#/world/server/player-record"
import type { PlayerCommandInput } from "#/world/server/player-operation-types"

export function runPlayerCommand(record: PlayerRecord, input: PlayerCommandInput, now: number): Transition {
  if (record.trade?.status === "prepared") return { ok: false, reason: "NOT_READY" }
  const result = apply(restoreSavedPlayer(record.player), input.command, { ...input.context, now })
  if (result.ok) {
    publishPlayer(record, result.state)
    if (input.command.type === "revive") advanceCombatLife(record)
    if (result.state.hp <= 0) freezePlayerLocation(record, now)
  }
  return result.ok ? { ...result, state: record.player } : result
}
