import { F, PLAZA_H } from "#/world/scene/world"
import { ensureFields } from "#/world/scene/ensure-fields"
import type { Fields } from "#/world/maps/ground/types"

/** A copy of the fields of the plan in use. */
export function fieldsNow(): Fields {
  ensureFields()
  return { h: F.h.slice(), river: F.river.slice(), road: F.road.slice(), roadKind: F.roadKind.slice(), trail: F.trail.slice(), plazaH: PLAZA_H.value }
}
