import { TOWN_SPAWN } from "#/world/core/player-rules"
import type { PlayerLocation } from "#/world/core/location-types"

/** A world change starts at a fresh town route and never inherits another connection's authority. */
export function townLocation(world: number, now: number): PlayerLocation {
  return { world, map: TOWN_SPAWN.map, route: [[...TOWN_SPAWN.cell]], since: now, connection: null }
}
