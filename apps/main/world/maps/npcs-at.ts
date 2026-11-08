import { RESIDENTS } from "#/world/town/residents"
import { spotAt } from "#/world/town/spot-at"
import { RESIDENT_WORK_SPOTS } from "#/world/maps/resident-work-spots"
import { cellOfSpot } from "#/world/maps/cell-of-spot"
import type { Cell, MapDefinition } from "#/world/maps/types"

/** Who is on this map at `min` (minutes past midnight, Japan time), and where. */
export function npcsAt(map: MapDefinition, minute: number): { name: string; cell: Cell }[] {
  const presentResidents: { name: string; cell: Cell }[] = []
  for (const resident of RESIDENTS) {
    const spot = spotAt(resident.name, minute, RESIDENT_WORK_SPOTS.get(resident.name)!)
    const cell = spot && spot.map === map.id ? cellOfSpot(spot) : null
    if (cell) presentResidents.push({ name: resident.name, cell })
  }
  return presentResidents
}
