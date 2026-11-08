import { isNatureState } from "#/world/server/is-nature-state"
import type { NatureState } from "#/world/core/nature/types"

/** Return the original valid record; unreadable data must never become a new empty world. */
export function restoreNature(saved: unknown): NatureState {
  if (!isNatureState(saved)) throw new Error("Saved gathering data is unreadable")

  return saved
}
