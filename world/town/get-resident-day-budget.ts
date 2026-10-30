import { residentDayPlanSchema, RESIDENT_DAY_MINUTES } from "#/world/town/resident-day-plan-schema"
import { getResidentDayTransition } from "#/world/town/get-resident-day-transition"
import { getResidentDayPlaceKey } from "#/world/town/get-resident-day-place-key"
import type { ResidentDayActivity } from "#/world/town/resident-day-plan-schema"

/** Reserve the cyclic day exactly once, including travel; task capacity and actual durations remain separate. */
export function getResidentDayBudget(input: unknown) {
  const parsed = residentDayPlanSchema.safeParse(input)
  if (!parsed.success) return new Error("Invalid proposed resident day structure")
  const segments = parsed.data.segments,
    first = getResidentDayTransition(segments[0]),
    cursor = { minute: 0, place: first.from }
  const minutesByActivity: Record<ResidentDayActivity, number> = {
    sleep: 0,
    prepare_food: 0,
    meal: 0,
    cleanup: 0,
    hygiene: 0,
    water: 0,
    food_collection: 0,
    fuel_ash: 0,
    laundry: 0,
    clean: 0,
    work: 0,
    rest: 0,
    travel: 0,
  }
  for (const segment of segments) {
    const transition = getResidentDayTransition(segment)
    if (segment.from_min !== cursor.minute || segment.to_min <= segment.from_min) return new Error("Proposed day has a gap, overlap or nonpositive interval")
    if (getResidentDayPlaceKey(transition.from) !== getResidentDayPlaceKey(cursor.place)) return new Error("Proposed day changes place without reserved travel")
    minutesByActivity[transition.activity] += segment.to_min - segment.from_min
    cursor.minute = segment.to_min
    cursor.place = transition.to
  }
  if (cursor.minute !== RESIDENT_DAY_MINUTES) return new Error("Proposed day does not reserve the whole day")
  if (getResidentDayPlaceKey(cursor.place) !== getResidentDayPlaceKey(first.from)) return new Error("Proposed day changes place at midnight")

  return { totalMinutes: cursor.minute, minutesByActivity }
}
