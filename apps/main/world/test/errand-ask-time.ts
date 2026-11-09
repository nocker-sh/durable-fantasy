import { dayOf } from "#/world/core/day-of"
import { errandToday } from "#/world/core/errand-today"
import type { Errand } from "#/world/core/errand-types"
import { jstMinutes } from "#/world/core/jst-minutes"
import { canAskErrand } from "#/world/maps/can-ask-errand"

const DAY = 86_400_000
const QUARTER = 15 * 60_000
const FIRST_DAY = Date.parse("2026-10-20T21:00:00Z")

/**
 * The first quarter hour, from the errand day that starts at `from` (six in Japan) on, at which the
 * asker has this errand that day and still asks it (can-ask-errand.ts); where they stand is not chosen.
 */
export function errandAskTime(errand: Errand, from = FIRST_DAY): number {
  for (let day = 0; day < 400; day++) {
    const start = from + day * DAY
    if (errandToday(errand.from, dayOf(start))?.id !== errand.id) continue
    const at = Array.from({ length: 96 }, (_, step) => start + step * QUARTER).find((time) => canAskErrand(errand, jstMinutes(time)))
    if (at !== undefined) return at
  }
  throw new Error(`${errand.id}: never asked`)
}
