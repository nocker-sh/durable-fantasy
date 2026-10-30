import { CLAIM_MS } from "#/world/core/monsters"
import type { WildState } from "#/world/core/wild/types"

/** An abandoned fight lapses at the claim boundary without rewriting the saved record. */
export function fighting(state: WildState, id: string, now: number): string | null {
  const fight = state.by?.[id]

  return fight && now - fight.at < CLAIM_MS ? fight.player : null
}
