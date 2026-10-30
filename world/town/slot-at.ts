import type { Slot } from "#/world/town/routine-types"
import { schedules } from "#/world/town/routines"

/** The slot someone is in at `min`; definitions are sorted once when loaded. */
export function slotAt(name: string, min: number): Slot | null {
  return schedules.get(name)?.at(min) ?? null
}
