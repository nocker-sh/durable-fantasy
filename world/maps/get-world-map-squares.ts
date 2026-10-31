import { assertWorldSquarePosition } from "#/world/maps/assert-world-square-position"
import type { Square } from "#/world/maps/grid-types"

/** Locked cities still reserve their square; ambiguous reservations cannot define physical placement. */
export function getWorldMapSquares(squares: readonly Square[]): ReadonlyMap<string, Square> {
  const occupied = new Set<string>(),
    maps = new Map<string, Square>()
  for (const square of squares) {
    assertWorldSquarePosition(square.at)
    if (Boolean(square.map) === Boolean(square.city)) throw new Error("World-space square must reserve one map or city")
    const key = square.at.join(",")
    if (occupied.has(key)) throw new Error(`World-space squares overlap: ${key}`)
    occupied.add(key)
    if (square.map) {
      if (maps.has(square.map)) throw new Error(`World-space map has multiple squares: ${square.map}`)
      maps.set(square.map, square)
    }
  }
  return maps
}
