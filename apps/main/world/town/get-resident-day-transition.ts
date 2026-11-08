import type { z } from "zod"
import type { ResidentDayActivity, residentDayPlaceSchema, residentDaySegmentSchema } from "#/world/town/resident-day-plan-schema"
type Props = Readonly<z.infer<typeof residentDaySegmentSchema>>
type Transition = Readonly<{ from: z.infer<typeof residentDayPlaceSchema>; to: z.infer<typeof residentDayPlaceSchema>; activity: ResidentDayActivity }>

/** A stay preserves its location; travel explicitly reserves time between both declared places. */
export function getResidentDayTransition(segment: Props): Transition {
  if (segment.kind === "stay") return { from: segment.place, to: segment.place, activity: segment.activity }

  return { from: segment.from, to: segment.to, activity: "travel" }
}
