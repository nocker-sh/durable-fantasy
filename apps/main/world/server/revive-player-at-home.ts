import { apply } from "#/world/core/apply"
import { restoreSavedPlayer } from "#/world/server/restore-saved-player"
import { publishPlayer } from "#/world/server/publish-player"
import { advanceCombatLife } from "#/world/server/advance-combat-life"
import type { Transition } from "#/world/core/transition"
import type { PlayerRevivalRecord } from "#/world/server/player-location-types"

/** The enclosing player transaction saves health, publication, life and home location together. */
export function revivePlayerAtHome(record: PlayerRevivalRecord, connection: string, now: number): Transition {
  const location = record.location
  if (!location || location.connection !== connection || record.trade?.status === "prepared") return { ok: false, reason: "NOT_READY" }
  const result = apply(restoreSavedPlayer(record.player), { type: "revive" }, { now })
  if (!result.ok) return result
  publishPlayer(record, result.state)
  advanceCombatLife(record)
  const home = result.state.savePoint
  record.location = { ...location, map: home.map, route: [[home.cell[0], home.cell[1]]], since: now, connection: null }
  return { ...result, state: record.player }
}
