import { RESIDENTS } from "#/world/town/residents"
import { HOUSEHOLDS } from "#/world/town/houses"
import type { HouseDef } from "#/world/town/house-types"
import { INTERIORS } from "#/world/town/interiors"
import { slotAt } from "#/world/town/slot-at"
import { spotAt } from "#/world/town/spot-at"
import { workSpot } from "#/world/town/work-spot"

/**
 * Is anyone of this household up indoors at `min`: home and not asleep, or at work inside this very
 * building (a shop over which they live).
 */
export function upIndoors(h: HouseDef, min: number): boolean {
  const members = HOUSEHOLDS.find((x) => x.id === h.household)?.members ?? []
  const inside = INTERIORS.find((i) => i.house === h)?.id
  return members.some((name) => {
    const s = slotAt(name, min)
    if (!s) return false
    if (s.where === "home") return !s.doing.includes("眠")
    const r = RESIDENTS.find((x) => x.name === name)
    const spot = r && spotAt(name, min, workSpot(r))
    return !!inside && spot?.map === inside
  })
}
