import { MAPS } from "#/world/maps"
import type { Cell } from "#/world/maps/types"
import type { Spot } from "#/world/town/routine-types"
import { getSpotCell } from "#/world/maps/get-spot-cell"

/** The cell a spot stands for, or null when the place is unknown. */
export function cellOfSpot(spot: Spot): Cell | null {
  return getSpotCell({ spot, places: MAPS[spot.map]?.places ?? null })
}
