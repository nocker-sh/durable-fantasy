import type { Bag, Mark } from "#/world/core/bag-types"
import type { ItemId } from "#/world/core/items/catalog"
import { matches } from "#/world/core/matches"

export function countItem(bag: Bag, item: ItemId, mark?: Partial<Mark>): number {
  return bag.reduce((total, slot) => total + (matches(slot, item, mark) ? slot.count : 0), 0)
}
