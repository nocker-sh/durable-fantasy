import { SHOPS } from "#/world/core/shops"
import { spotAt } from "#/world/town/spot-at"
import { RESIDENT_WORK_SPOTS } from "#/world/maps/resident-work-spots"
import { slotAt } from "#/world/town/slot-at"
import type { Spot } from "#/world/town/routine-types"

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
  // at the counter, not merely somewhere on the same map: eating at a neighbour's stall or tending a grave
  // is not keeping the shop (town.md「暮らしの時間」)
  const slot = slotAt(residentName, minute)
  if (!slot) return false
  return slot.where === "work" || (typeof slot.where === "object" && sameSpot(slot.where, workplace))
}

function sameSpot(a: Spot, b: Spot): boolean {
  if (a.map !== b.map) return false
  if ("place" in a) return "place" in b && a.place === b.place
  if ("cell" in a) return "cell" in b && a.cell[0] === b.cell[0] && a.cell[1] === b.cell[1]
  return "tile" in b && a.tile[0] === b.tile[0] && a.tile[1] === b.tile[1]
}
