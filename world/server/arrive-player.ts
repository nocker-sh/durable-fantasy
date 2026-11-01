import { locationAt } from "#/world/core/location-at"
import { townLocation } from "#/world/core/town-location"
import { mayCrossWorldsFrom } from "#/world/maps/may-cross-worlds-from"
import type { PlayerArrival, PlayerArrivalInput, PlayerMovementRecord } from "#/world/server/player-location-types"

/** Reconnect at completed progress; another world starts in town without inheriting connection authority, and is entered from a town only. */
export function arrivePlayer(record: PlayerMovementRecord, input: PlayerArrivalInput, now: number): PlayerArrival {
  const previous = record.location
  // the thread is followed from a town only: out in the wild they stay in their own world, where they are
  if (previous && previous.world !== input.world && !mayCrossWorldsFrom(previous.map)) return { map: previous.map, at: locationAt(previous, now), world: previous.world, accepted: false }
  const location = previous?.world === input.world ? previous : townLocation(input.world, now)
  const at = locationAt(location, now)
  if (location.map !== input.map) return { map: location.map, at, accepted: false }
  record.location = { ...location, route: [at], since: now, connection: input.connection }
  return { map: input.map, at, accepted: true }
}
