import { dayOf } from "#/world/core/day-of"
import type { Taken } from "#/world/core/errand-types"

/** 期限を過ぎた受注を除き、当日分だけを返す。 */
export function todays(taken: readonly Taken[], now: number) {
  return taken.filter((errand) => errand.day === dayOf(now))
}
