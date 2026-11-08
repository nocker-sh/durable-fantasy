import { addItem } from "#/world/core/add-item"
import { emptyBag } from "#/world/core/empty-bag"
import type { Bag } from "#/world/core/bag-types"
import type { ItemId } from "#/world/core/items/catalog"

export const bagWith = (...items: [ItemId, number][]): Bag =>
  items.reduce<Bag>((bag, entry) => {
    const id = entry[0]
    const n = entry[1]
    return addItem({ bag: bag, item: id, count: n })!
  }, emptyBag())
