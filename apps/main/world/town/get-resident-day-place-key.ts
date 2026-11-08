import type { z } from "zod"
import type { residentDayPlaceSchema } from "#/world/town/resident-day-plan-schema"
type Props = Readonly<z.infer<typeof residentDayPlaceSchema>>

/** District symbols belong to this resident's town; room identities never alias district symbols. */
export function getResidentDayPlaceKey(place: Props): string {
  if (place.kind === "room") return `room:${place.room}`

  return `district:${place.symbol}`
}
