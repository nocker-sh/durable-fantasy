import type { Bag } from "#/world/core/bag-types"
import type { ItemId } from "#/world/core/items/catalog"

/** The first stack of the item, for using it from the hotbar. */
export function firstOf(bag: Bag, item: ItemId): number {
  return bag.findIndex((s) => s?.item === item)
}
