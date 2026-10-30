import { keeperPlace } from "#/world/town/keeper-place"
import type { Spot } from "#/world/town/routines"

/** A resident's work spot from their entry in residents.ts. */
export function workSpot(r: { name: string; map?: string; at: string | readonly [number, number] }): Spot {
  const keeper = keeperPlace(r.name)
  if (keeper) return { map: keeper.map, cell: keeper.cell }
  const map = r.map ?? "phanthiet"
  return typeof r.at === "string" ? { map, place: r.at } : { map, tile: r.at }
}
