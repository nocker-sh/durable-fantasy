import { outsideDoor } from "#/world/town/outside-door"
import type { Interior } from "#/world/town/interiors"
import type { MapDefinition } from "#/world/maps/types"

/** Add only ground-floor street portals; upper floors remain connected through their stairs. */
export function withIndoorMapDoors(map: MapDefinition, interiors: readonly Interior[]): MapDefinition {
  const doors = interiors
    .filter((interior) => interior.floor === 0 && interior.house.map === map.id)
    .map((interior) => ({ at: outsideDoor(interior.house).door, to: { map: interior.id, at: interior.arrive } }))
  return { ...map, warps: [...map.warps, ...doors] }
}
