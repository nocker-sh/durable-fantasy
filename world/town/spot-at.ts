import { INTERIORS } from "#/world/town/interiors"
import { seatsOf } from "#/world/town/interior-seats-of"
import type { Spot } from "#/world/town/routine-types"
import { slotAt } from "#/world/town/slot-at"
import { routinePatrons } from "#/world/town/routines"

/**
 * Where someone stands at `min`: a spot, or null when they are at home out of sight. `work` is
 * their usual spot (residents.ts, with shopkeepers behind their counters).
 */
export function spotAt(name: string, min: number, work: Spot): Spot | null {
  const s = slotAt(name, min)
  if (!s || s.where === "home") return null
  if (s.where === "work") return work
  if (s.where === "tavern" || s.where === "inn") {
    const it = INTERIORS.find((i) => i.house.id === s.where)
    if (!it) return null
    const seats = seatsOf(it)
    // the seats go round those who are there at this hour, in a fixed order
    const here = routinePatrons[s.where].filter((n) => slotAt(n, min)?.where === s.where)
    const k = here.indexOf(name)
    return seats.length && k >= 0 ? { map: it.id, cell: seats[k % seats.length] } : null
  }
  return s.where
}
