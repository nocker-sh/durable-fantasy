import { GRID_SIZE } from "#/world/maps/grid"
import type { Square } from "#/world/maps/grid-types"

/** A missing coordinate must not become a reserved square or a non-finite metric origin. */
export function assertWorldSquarePosition(at: Square["at"]): void {
  if (!Array.isArray(at) || at.length !== 2 || !Number.isSafeInteger(at[0]) || !Number.isSafeInteger(at[1]) || at[0] < 0 || at[1] < 0 || at[0] >= GRID_SIZE.cols || at[1] >= GRID_SIZE.rows)
    throw new Error("Invalid world-space square")
}
