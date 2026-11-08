import { STEP, OPPOSITE } from "#/world/maps/grid"
import { squareAt } from "#/world/maps/square-at"
import type { Side, Square } from "#/world/maps/grid-types"

/** The square across a side, if the side is open on both squares. */
export function across(square: Square, side: Side): Square | undefined {
  const neighbor = squareAt(square.at[0] + STEP[side][0], square.at[1] + STEP[side][1])
  if (!neighbor || square.walls?.includes(side) || neighbor.walls?.includes(OPPOSITE[side])) return undefined
  return neighbor
}
