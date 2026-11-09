import { locationAt } from "#/world/core/location-at"
import type { PlayerMovementRecord } from "#/world/server/player-location-types"

/** Freeze completed progress at one timestamp; a stale connection cannot stop its replacement. */
export function leavePlayer(record: PlayerMovementRecord, connection: string, now: number): void {
  const location = record.location
  if (location?.connection === connection) record.location = { ...location, route: [locationAt(location, now)], since: now, connection: null }
}
