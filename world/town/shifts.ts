// The town's three shifts (town.md「三交代」): when each resident gets up after their longest sleep
// says which shift they keep. Read off routines.ts, so a day written there decides the shift.
import { RESIDENTS } from "./residents.ts"
import { slotAt } from "./routines.ts"

export type Shift = "朝番" | "昼番" | "夜番"

const asleep = (name: string, min: number) => {
  const s = slotAt(name, ((min % 1440) + 1440) % 1440)
  return s?.where === "home" && s.doing.includes("眠")
}

/** The minute someone gets up after their longest sleep of the day. */
export function wakeOf(name: string): number {
  let best = -1,
    wake = 0
  for (let m = 0; m < 1440; m += 15) {
    if (!asleep(name, m) || asleep(name, m - 15)) continue
    let len = 0
    while (len < 1440 && asleep(name, m + len)) len += 15
    if (len > best) [best, wake] = [len, (m + len) % 1440]
  }
  return wake
}

/** Up before six: the morning shift; before noon: the day shift; after: the night shift. */
export function shiftOf(name: string): Shift {
  const w = wakeOf(name)
  return w < 6 * 60 ? "朝番" : w < 12 * 60 ? "昼番" : "夜番"
}

/** Everyone, by shift. */
export const SHIFTS: Readonly<Record<Shift, readonly string[]>> = {
  朝番: RESIDENTS.filter((r) => shiftOf(r.name) === "朝番").map((r) => r.name),
  昼番: RESIDENTS.filter((r) => shiftOf(r.name) === "昼番").map((r) => r.name),
  夜番: RESIDENTS.filter((r) => shiftOf(r.name) === "夜番").map((r) => r.name),
}
