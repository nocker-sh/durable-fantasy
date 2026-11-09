import { within } from "#/world/core/within"
import { scheduleMinute } from "#/world/town/schedule-minute"

/**
 * The street lamps: the guard lights them one after another at dusk, starting at 16:40 and taking a
 * minute or so for each, and puts them out in the same order once the day is up.
 */
export function lampLit(index: number, min: number): boolean {
  const on = scheduleMinute(16, 40) + Math.round(index * 1.3),
    off = scheduleMinute(10, 20) + Math.round(index * 1.1)
  return within(min, on % 1440, off % 1440)
}
