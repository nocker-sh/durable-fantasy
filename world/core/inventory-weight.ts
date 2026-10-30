import { ITEMS } from "#/world/core/items/catalog"
import type { PlayerState } from "#/world/core/player-types"

/** Everything carried: the bag and what is worn. */
export function carried(state: Pick<PlayerState, "bag" | "equipment">): number {
  const bagWeight = state.bag.reduce((weight, stack) => weight + (stack ? ITEMS[stack.item].weight * stack.count : 0), 0)

  return Object.values(state.equipment).reduce((weight, item) => weight + (item ? ITEMS[item].weight : 0), bagWeight)
}
