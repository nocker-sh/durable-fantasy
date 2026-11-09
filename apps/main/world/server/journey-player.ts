import { runPlayerCommand } from "#/world/server/run-player-command"
import { travelPlayer } from "#/world/server/travel-player"
import { leadsTowardTown } from "#/world/maps/leads-toward-town"
import type { PlayerRecord } from "#/world/server/player-record"
import type { PlayerJourney, PlayerJourneyInput } from "#/world/server/player-location-types"

/** 道のりの疲れと行き先を同じ保存で確定する。移れないときは疲れも残さない（game-system.md §3.6）。 */
export function journeyPlayer(record: PlayerRecord, input: PlayerJourneyInput, now: number): PlayerJourney {
  const location = record.location
  if (!location || location.connection !== input.connection || record.player.hp <= 0) return { ok: false }
  if (input.tire > 0) {
    // the saved map, not the room's word, decides whether the road leads nearer town
    const command = { type: "tire" as const, amount: input.tire, homeward: leadsTowardTown(location.map, input.map) }
    const tired = runPlayerCommand(record, { command, context: {} }, now)
    if (!tired.ok) return { ok: false, reason: tired.reason }
  }
  if (!travelPlayer(record, input, now)) return { ok: false }
  return { ok: true }
}
