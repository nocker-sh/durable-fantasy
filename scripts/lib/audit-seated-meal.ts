import { seatedMealReviewSchema } from "#/scripts/lib/seated-meal-review-schema"
import { getDiningSeatGeometry } from "#/scripts/lib/get-dining-seat-geometry"
import { getReviewedDiningBodyError } from "#/scripts/lib/get-reviewed-dining-body-error"
import { RESIDENTS, RESIDENT_LOOKS } from "#/world/town/residents"
import type { SettingDocument } from "#/scripts/lib/setting-document"

/** Resolve named diners before comparing their native shoes and knees with the authored dining furniture. */
export function auditSeatedMeal(room: SettingDocument, documents: ReadonlyMap<string, SettingDocument>): readonly string[] {
  if (room.seated_body_review === undefined) return []
  const parsed = seatedMealReviewSchema.safeParse(room)
  if (!parsed.success || room.kind !== "rooms" || !room.grid) return [`${room.id}: Invalid seated meal review`]
  const errors: string[] = []
  const table = room.furniture?.find((furniture) => furniture.symbol === parsed.data.household_meal.table)
  for (const seat of parsed.data.household_meal.seats) {
    const diner = documents.get(seat.resident),
      chair = room.furniture?.find((furniture) => furniture.symbol === seat.chair)
    const look = RESIDENT_LOOKS[RESIDENTS.findIndex((resident) => resident.name === diner?.title)]
    if (diner?.kind !== "residents" || !look || !table || !chair) {
      errors.push(`${room.id}: Seated diner or furniture is unavailable`)
      continue
    }
    const geometry = getDiningSeatGeometry({ chair, table, cell: room.grid.cell_m })
    if (geometry instanceof Error) {
      errors.push(`${room.id}/${seat.chair}: ${geometry.message}`)
      continue
    }
    const error = getReviewedDiningBodyError({ look, geometry, resident: seat.resident, review: parsed.data.seated_body_review })
    if (error) errors.push(`${room.id}/${seat.chair}: ${error.message}`)
  }
  if (room.design_gate === "通過") errors.push(`${room.id}: Seated transitions and operation remain unverified`)

  return errors
}
