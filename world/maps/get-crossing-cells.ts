import { CROSSING_EDGE, CROSSING_ARRIVAL_OFFSET } from "#/world/maps/crossing-rules"
import type { Cell } from "#/world/maps/types"
import type { Side } from "#/world/maps/grid-types"

export function getCrossingCells(size: number, side: Side, at: number): { at: Cell; arrive: Cell } {
  const lo = CROSSING_EDGE,
    hi = size - 1 - CROSSING_EDGE + 1
  switch (side) {
    case "w":
      return { at: [lo, at], arrive: [lo + CROSSING_ARRIVAL_OFFSET, at] }
    case "e":
      return { at: [hi, at], arrive: [hi - CROSSING_ARRIVAL_OFFSET, at] }
    case "n":
      return { at: [at, lo], arrive: [at, lo + CROSSING_ARRIVAL_OFFSET] }
    case "s":
      return { at: [at, hi], arrive: [at, hi - CROSSING_ARRIVAL_OFFSET] }
  }
}
