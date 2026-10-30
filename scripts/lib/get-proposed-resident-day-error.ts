import type { ResidentDayActivity } from "#/world/town/resident-day-plan-schema"
import type { z } from "zod"
import type { residentProposalSchema } from "#/scripts/lib/resident-proposal-schema"
import type { townDistrictPlanSchema } from "#/scripts/lib/town-district-plan-schema"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import { getResidentDayBudget } from "#/world/town/get-resident-day-budget"
import { getResidentDayTransition } from "#/world/town/get-resident-day-transition"
import { getProposedDayPlaceError } from "#/scripts/lib/get-proposed-day-place-error"
import { getProposedResidentTravelError } from "#/scripts/lib/get-proposed-resident-travel-error"
type Props = Readonly<{ resident: SettingDocument; proposal: z.infer<typeof residentProposalSchema>; study: z.infer<typeof townDistrictPlanSchema>; documents: ReadonlyMap<string, SettingDocument> }>

/** Check the time reservation and its places without certifying task quantities, actual routes or native animation. */
export function getProposedResidentDayError(props: Props): Error | null {
  const day = props.proposal.day_plan
  if (!day) return null
  const budget = getResidentDayBudget(day)
  if (budget instanceof Error) return budget
  const essential: ReadonlyArray<ResidentDayActivity> = ["sleep", "meal", "water", "hygiene", "work", "rest"]
  for (const activity of essential) if (budget.minutesByActivity[activity] <= 0) return new Error(`Proposed workday reserves no ${activity} time`)
  for (const segment of day.segments) {
    const transition = getResidentDayTransition(segment)
    for (const place of [transition.from, transition.to]) {
      const error = getProposedDayPlaceError({ ...props, place, activity: transition.activity })
      if (error) return error
    }
  }

  return getProposedResidentTravelError({ resident: props.resident, day, documents: props.documents })
}
