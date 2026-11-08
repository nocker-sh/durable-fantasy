import type { WildState } from "#/world/core/wild/types"

/** A creature remains unavailable until its recorded recovery time. */
export function about(state: WildState, id: string, now: number): boolean {
  return (state.back[id] ?? 0) <= now
}
