import { RESIDENTS } from "#/world/town/residents"
import type { HouseDef } from "#/world/town/house-types"
import { INTERIORS } from "#/world/town/interiors"
import { spotAt } from "#/world/town/spot-at"
import { workSpot } from "#/world/town/work-spot"

/** Shared public rooms are in use while a resident's explicit routine puts them there. */
export function roomInUse(h: HouseDef, floor: number, min: number): boolean {
  const inside = INTERIORS.find((it) => it.house.id === h.id && it.floor === floor)?.id
  return !!inside && RESIDENTS.some((resident) => spotAt(resident.name, min, workSpot(resident))?.map === inside)
}
