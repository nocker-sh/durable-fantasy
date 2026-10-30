import type { z } from "zod"
import type { residentDayPlanSchema } from "#/world/town/resident-day-plan-schema"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import { getProposedRoomRouteError } from "#/scripts/lib/get-proposed-room-route-error"
type Props = Readonly<{ resident: SettingDocument; day: z.infer<typeof residentDayPlanSchema>; documents: ReadonlyMap<string, SettingDocument> }>

/** Stays do not imply walking through walls; each reserved indoor journey has its own authored sequence. */
export function getProposedResidentTravelError(props: Props): Error | null {
  for (const segment of props.day.segments) {
    if (segment.kind !== "travel") continue
    const error = getProposedRoomRouteError({ resident: props.resident, segment, documents: props.documents })
    if (error) return error
  }

  return null
}
