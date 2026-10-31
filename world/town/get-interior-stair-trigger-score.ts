import type { Cell } from "#/world/town/interiors"
import type { Rect } from "#/world/town/floorplan/types"

/** Prefer a walkable landing cell near the flight, then its centre; enumeration breaks remaining ties. */
export function getInteriorStairTriggerScore(cell: Cell, landing: Rect, flight: Rect): number {
  const x = (cell[0] + 0.5) / 2,
    z = (cell[1] + 0.5) / 2
  const gap = Math.hypot(Math.max(flight.x0 - x, 0, x - flight.x1), Math.max(flight.z0 - z, 0, z - flight.z1))
  return gap * 100 + Math.hypot(x - (landing.x0 + landing.x1) / 2, z - (landing.z0 + landing.z1) / 2)
}
