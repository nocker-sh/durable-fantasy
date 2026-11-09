import { DAY_TURNS } from "#/world/core/clock-rules"
import { ERRAND_HAND_MARGIN } from "#/world/core/errand-rules"
import type { Errand } from "#/world/core/errand-types"
import { MAPS, TALK_CELLS } from "#/world/maps"
import { cellDistance } from "#/world/maps/cell-distance"
import { cellOfSpot } from "#/world/maps/cell-of-spot"
import { RESIDENT_WORK_SPOTS } from "#/world/maps/resident-work-spots"
import type { Cell } from "#/world/maps/types"
import { spotAt } from "#/world/town/spot-at"

const DAY_MINUTES = 24 * 60
// schedules depend only on the minute of the day, so each resident's last minute out is worked out once
const lastOut = new Map<string, number>()

/**
 * Whether the asker asks this errand at `minute` (economy.md §6.1): the one it is handed to can
 * still be met at least ERRAND_HAND_MARGIN minutes later before the errand day turns over, and a
 * parcel is not asked to be carried to someone standing within talking distance of the asker.
 * The dialogue offers and the room accepts by this same rule.
 */
export function canAskErrand(errand: Errand, minute: number): boolean {
  const since = (((minute - DAY_TURNS) % DAY_MINUTES) + DAY_MINUTES) % DAY_MINUTES
  if (lastOutOf(errand.kind === "bring" ? errand.from : errand.to) < since + ERRAND_HAND_MARGIN) return false
  if (errand.kind === "bring") return true
  const asker = placeAt(errand.from, minute)
  const recipient = placeAt(errand.to, minute)
  return !asker || !recipient || asker.map !== recipient.map || cellDistance(asker.cell, recipient.cell) > TALK_CELLS
}

/** The last minute of the errand day, counted from when it turns over, that `name` is out; -1 if never. */
function lastOutOf(name: string): number {
  const known = lastOut.get(name)
  if (known !== undefined) return known
  const last = Array.from({ length: DAY_MINUTES }, (_, step) => DAY_MINUTES - 1 - step).find((since) => placeAt(name, (DAY_TURNS + since) % DAY_MINUTES)) ?? -1
  lastOut.set(name, last)
  return last
}

/** Where `name` can be met at `minute`, found the way npc-cell.ts finds them on a map. */
function placeAt(name: string, minute: number): { map: string; cell: Cell } | null {
  const spot = spotAt(name, minute, RESIDENT_WORK_SPOTS.get(name) ?? { map: "", place: "" })
  const cell = spot && Object.hasOwn(MAPS, spot.map) ? cellOfSpot(spot) : null
  return spot && cell ? { map: spot.map, cell } : null
}
