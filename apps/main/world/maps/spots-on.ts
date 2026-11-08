import { RESIDENTS } from "#/world/town/residents"
import { ROUTINES } from "#/world/town/routines"
import { spotAt } from "#/world/town/spot-at"
import { RESIDENT_WORK_SPOTS } from "#/world/maps/resident-work-spots"
import { cellOfSpot } from "#/world/maps/cell-of-spot"
import type { Cell, MapDefinition } from "#/world/maps/types"

/** Every spot anyone stands on on this map at some hour, for tests and the dev pages. */
export function spotsOn(map: MapDefinition): { name: string; cell: Cell; doing: string }[] {
  const standingSpots: { name: string; cell: Cell; doing: string }[] = []
  for (const resident of RESIDENTS)
    for (const slot of ROUTINES[resident.name] ?? []) {
      const spot = spotAt(resident.name, slot.from, RESIDENT_WORK_SPOTS.get(resident.name)!)
      const cell = spot && spot.map === map.id ? cellOfSpot(spot) : null
      if (cell && !standingSpots.some((entry) => entry.name === resident.name && entry.cell[0] === cell[0] && entry.cell[1] === cell[1]))
        standingSpots.push({ name: resident.name, cell, doing: slot.doing })
    }
  return standingSpots
}
