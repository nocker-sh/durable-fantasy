import { ITEMS } from "./items.ts"
import type { PlayerState } from "./player.ts"

/** Everything carried: the bag and what is worn. */
export function carried(state: Pick<PlayerState, "bag" | "equipment">): number {
  let total = 0
  for (const s of state.bag) if (s) total += ITEMS[s.item].weight * s.count
  for (const id of Object.values(state.equipment)) if (id) total += ITEMS[id].weight
  return total
}
