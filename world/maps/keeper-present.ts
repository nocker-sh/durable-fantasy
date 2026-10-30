import { SHOPS } from "#/world/core/shops"
import { spotAt } from "#/world/town/spot-at"
import { MAPS } from "#/world/maps"
import { RESIDENT_WORK_SPOTS } from "#/world/maps/resident-work-spots"
import { npcCell } from "#/world/maps/npc-cell"

/** Whether this particular keeper is present for this shop, including separate street pitches. */
export function keeperPresent(shopId: keyof typeof SHOPS, residentName: string, minute: number): boolean {
  if (!SHOPS[shopId].keepers.some((keeper) => keeper === residentName)) return false
  const workplace = RESIDENT_WORK_SPOTS.get(residentName)
  if (!workplace) return false
  const definition = SHOPS[shopId]
  const pitch = "at" in definition ? definition.at : null
  if (pitch) {
    const spot = spotAt(residentName, minute, workplace)
    return !!spot && "place" in spot && spot.map === pitch.map && spot.place === pitch.place
  }
  return npcCell(MAPS[workplace.map], residentName, minute) !== null
}
