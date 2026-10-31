import { locationAt } from "#/world/core/location-at"
import type { PlayerRecord } from "#/world/server/player-record"

/** A fall preserves the current connection but stops only the distance already completed. */
export function freezePlayerLocation(record: Pick<PlayerRecord, "location">, now: number): void {
  const location = record.location
  if (location) record.location = { ...location, route: [locationAt(location, now)], since: now }
}
