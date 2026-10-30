import { CELLS_PER_SECOND } from "#/world/protocol"
import type { Cell } from "#/world/protocol"
import type { PlayerLocation } from "#/world/core/location-types"

/** Resume only distance already walked, never the untravelled end of a submitted path. */
export function locationAt(location: PlayerLocation, now: number): Cell {
  const progress = { distance: (Math.max(0, now - location.since) / 1000) * CELLS_PER_SECOND, at: location.route[0] }

  for (const next of location.route.slice(1)) {
    progress.distance -= Math.hypot(next[0] - progress.at[0], next[1] - progress.at[1])
    if (progress.distance < 0) break
    progress.at = next
  }

  return progress.at
}
