import { locationAt } from "#/world/core/location-at"
import { townLocation } from "#/world/core/town-location"
import type { PlayerArrivalInput, PlayerMovementRecord } from "#/world/server/player-location-types"

/** Reconnect at completed progress; another world starts in town without inheriting connection authority. */
export function arrivePlayer(record: PlayerMovementRecord, input: PlayerArrivalInput, now: number) {
  const location = record.location?.world === input.world ? record.location : townLocation(input.world, now)
  const at = locationAt(location, now)
  if (location.map !== input.map) return { map: location.map, at, accepted: false }
  record.location = { ...location, route: [at], since: now, connection: input.connection }
  return { map: input.map, at, accepted: true }
}
