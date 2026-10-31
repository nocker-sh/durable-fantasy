import type { PlayerMovementRecord, PlayerTravelInput } from "#/world/server/player-location-types"

/** Commit the destination before the next connection is admitted. */
export function travelPlayer(record: PlayerMovementRecord, input: PlayerTravelInput, now: number): boolean {
  const location = record.location
  if (!location || location.connection !== input.connection || record.player.hp <= 0) return false
  record.location = { ...location, map: input.map, route: [input.at], since: now, connection: null }
  return true
}
