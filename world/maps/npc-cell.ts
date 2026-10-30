import { jstMinutes } from "#/world/core/jst-minutes"
import { spotAt } from "#/world/town/spot-at"
import { RESIDENT_WORK_SPOTS } from "#/world/maps/resident-work-spots"
import { cellOfSpot } from "#/world/maps/cell-of-spot"
import type { Cell, MapDefinition } from "#/world/maps/types"

/** Where `name` stands on this map at `min`, or null if they are not here then. */
export function npcCell(map: MapDefinition, residentName: string, minute = jstMinutes(Date.now())): Cell | null {
  const spot = spotAt(residentName, minute, RESIDENT_WORK_SPOTS.get(residentName) ?? { map: "", place: "" })
  return spot && spot.map === map.id ? cellOfSpot(spot) : null
}
