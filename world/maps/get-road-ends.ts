import { layoutOf } from "#/world/maps/layouts"
import type { Side } from "#/world/maps/grid-types"

/** Locations in walk cells where the drawn road endpoints leave the fixed outdoor tile grid. */
export function getRoadEnds(id: string, side: Side): number[] {
  const ends: number[] = []
  for (const road of layoutOf(id).roads)
    for (const point of [road.pts[0], road.pts[road.pts.length - 1]]) {
      const off = side === "w" ? point[0] < 0.5 : side === "e" ? point[0] > 47.5 : side === "n" ? point[1] < 0.5 : point[1] > 47.5
      if (off) ends.push(Math.round((side === "w" || side === "e" ? point[1] : point[0]) * 2))
    }
  return ends
}
