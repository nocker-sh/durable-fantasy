import { dayOf } from "#/world/core/day-of"
import type { Taken } from "#/world/core/errand-types"

/** A corrected clock must not replace a newer day's accepted or completed requests. */
export function hasFutureErrands(taken: readonly Taken[], now: number): boolean {
  const day = dayOf(now)
  return taken.some((errand) => errand.day > day)
}
