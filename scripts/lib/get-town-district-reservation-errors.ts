import { getBuildingDistrictReservation } from "#/scripts/lib/get-building-district-reservation"
import type { z } from "zod"
import type { townDistrictPlanSchema } from "#/scripts/lib/town-district-plan-schema"
import type { SettingDocument } from "#/scripts/lib/setting-document"
type Props = Readonly<{ town: SettingDocument; plan: z.infer<typeof townDistrictPlanSchema>; documents: ReadonlyMap<string, SettingDocument> }>

/** Audit all declared footprints, including buildings with no resident forward reference, so land cannot be reserved twice. */
export function getTownDistrictReservationErrors(props: Props): readonly string[] {
  const errors: string[] = [],
    reservations: Exclude<ReturnType<typeof getBuildingDistrictReservation>, Error | null>[] = []
  for (const building of props.documents.values()) {
    if (building.town !== props.town.id) continue
    const reservation = getBuildingDistrictReservation({ building, townId: props.town.id, plan: props.plan })
    if (reservation instanceof Error) {
      errors.push(`${building.id}: ${reservation.message}`)
      continue
    }
    if (!reservation) continue
    for (const previous of reservations) {
      const a = reservation.bounds,
        b = previous.bounds
      if (reservation.district === previous.district && a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3])
        errors.push(`District land reservations overlap: ${previous.id} and ${reservation.id}`)
    }
    reservations.push(reservation)
  }

  return errors
}
