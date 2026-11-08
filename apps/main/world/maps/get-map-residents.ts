import { RESIDENTS } from "#/world/town/residents"
import { workSpot } from "#/world/town/work-spot"
import { getSpotCell } from "#/world/maps/get-spot-cell"
import type { MapDefinition } from "#/world/maps/types"

/** Resolve each resident once from the shared work definition, preserving resident order. */
export function getMapResidents(map: Pick<MapDefinition, "id" | "places">): MapDefinition["npcs"] {
  return RESIDENTS.flatMap((resident) => {
    const spot = workSpot(resident)
    const cell = spot.map === map.id ? getSpotCell({ spot, places: map.places }) : null
    return cell ? [{ name: resident.name, cell }] : []
  })
}
