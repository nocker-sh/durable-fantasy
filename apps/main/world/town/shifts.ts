// The town's three shifts (town.md「三交代」): when each resident gets up after their longest sleep
// says which shift they keep. Read off routines.ts, so a day written there decides the shift.
import { RESIDENTS } from "#/world/town/residents"
import { wakeOf } from "#/world/town/wake-of"

export type Shift = "朝番" | "昼番" | "夜番"

/** Up before six: the morning shift; before noon: the day shift; after: the night shift. */
function shiftOf(name: string): Shift {
  const w = wakeOf(name)
  return w < 6 * 60 ? "朝番" : w < 12 * 60 ? "昼番" : "夜番"
}

/** Everyone, by shift. */
export const SHIFTS: Readonly<Record<Shift, readonly string[]>> = {
  朝番: RESIDENTS.filter((r) => shiftOf(r.name) === "朝番").map((r) => r.name),
  昼番: RESIDENTS.filter((r) => shiftOf(r.name) === "昼番").map((r) => r.name),
  夜番: RESIDENTS.filter((r) => shiftOf(r.name) === "夜番").map((r) => r.name),
}
