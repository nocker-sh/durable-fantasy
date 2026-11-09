import { ITEMS } from "#/world/core/items/catalog"
import { SLOTS } from "#/world/core/items/kinds"
import { markFor } from "#/world/core/mark-for"
import { STARTING_WEAPON } from "#/world/core/player-rules"
import type { ItemId } from "#/world/core/items/catalog"
import type { Slot } from "#/world/core/items/kinds"
import type { Bag, Mark } from "#/world/core/bag-types"
import type { PlayerState, Worn } from "#/world/core/player-types"

/** Whether a made thing lacks part of its mark; a stick with none is the branch a new traveller picked up on the road. */
const unmarked = (item: ItemId, mark: Partial<Mark> | undefined): boolean => {
  const q = mark?.q !== undefined
  const by = mark?.by !== undefined
  return !!ITEMS[item].made && !(q && by) && (q || by || item !== STARTING_WEAPON)
}

const markBag = (bag: Bag): Bag => bag.map((stack) => (stack && unmarked(stack.item, stack) ? { ...stack, ...markFor(stack.item, stack) } : stack))

/** Made goods saved without a quality or maker get what new ones get: ordinary, by the usual maker, keeping any part they have (game-system.md §4.2.1). */
export function markOldGoods(state: PlayerState): PlayerState {
  const worn: Partial<Record<Slot, Worn>> = { ...state.worn }
  for (const slot of SLOTS) {
    const item = state.equipment[slot]
    if (item && unmarked(item, worn[slot])) worn[slot] = { ...worn[slot], ...markFor(item, worn[slot]) }
  }
  return { ...state, bag: markBag(state.bag), storage: markBag(state.storage), worn }
}
