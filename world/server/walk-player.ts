import type { PlayerMovementRecord, PlayerWalkInput } from "#/world/server/player-location-types"

/** The room validates the route; the player operation verifies current ownership and life before saving it. */
export function walkPlayer(record: PlayerMovementRecord, input: PlayerWalkInput, now: number): boolean {
  const location = record.location
  if (!location || location.connection !== input.connection || record.player.hp <= 0) return false
  record.location = { ...location, route: input.route, since: input.since === undefined ? now : input.since }
  return true
}
