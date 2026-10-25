import { CELLS_PER_SECOND, type Cell } from "../protocol.ts"
import { TOWN_SPAWN } from "./player.ts"

export interface PlayerLocation {
  world: number
  map: string
  route: Cell[]
  since: number
  connection: string | null
}

/** Resume only distance already walked, never the untravelled end of a submitted path. */
export function locationAt(location: PlayerLocation, now: number): Cell {
  let distance = (Math.max(0, now - location.since) / 1000) * CELLS_PER_SECOND
  let at = location.route[0]
  for (const next of location.route.slice(1)) {
    distance -= Math.hypot(next[0] - at[0], next[1] - at[1])
    if (distance < 0) break
    at = next
  }
  return at
}

export function townLocation(world: number, now: number): PlayerLocation {
  return { world, map: TOWN_SPAWN.map, route: [[...TOWN_SPAWN.cell]], since: now, connection: null }
}
