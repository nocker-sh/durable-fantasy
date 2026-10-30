import { INDOOR_SIZE } from "#/world/town/interior-rules"
import type { Interior } from "#/world/town/interiors"
import { isInteriorCellOpen } from "#/world/town/is-interior-cell-open"

/** The walk grid uses the same authored entrance, solids and stair wells as the room. */
export function interiorRows(interior: Interior): string[] {
  return Array.from({ length: INDOOR_SIZE }, (_, row) => Array.from({ length: INDOOR_SIZE }, (_, column) => (isInteriorCellOpen(interior, column, row) ? "." : "#")).join(""))
}
