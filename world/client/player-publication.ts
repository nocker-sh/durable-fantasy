import type { PlayerState } from "#/world/core/player-types"

/** Missing counters belong to older servers/saves and precede any numbered publication. */
export function currentPublication(current: PlayerState | null, incoming: PlayerState): boolean {
  const revision = incoming.revision ?? 0
  return Number.isSafeInteger(revision) && revision >= 0 && revision >= (current?.revision ?? 0)
}
