import { fightOf } from "#/world/core/wild/fight-of"
import type { WildState } from "#/world/core/wild/types"

/** Who holds the fight, while the claim lasts. */
export function fighting(state: WildState, id: string, now: number): string | null {
  return fightOf(state, id, now)?.player ?? null
}
