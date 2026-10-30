import type { Bag, Mark } from "#/world/core/bag-types"
import type { ItemId } from "#/world/core/items/catalog"
import { ITEMS } from "#/world/core/items/catalog"
import { markFor } from "#/world/core/mark-for"
import { sameKind } from "#/world/core/same-kind"
import { stackWithMark } from "#/world/core/stack-with-mark"

/** How many more fit: room on stacks of the same kind plus empty slots. */
export function roomFor(bag: Bag, item: ItemId, mark?: Partial<Mark>): number {
  const limit = ITEMS[item].stack
  const candidate = stackWithMark(item, 0, markFor(item, mark))

  return [...bag].reduce((room, slot) => room + (!slot ? limit : sameKind(slot, candidate) ? limit - slot.count : 0), 0)
}
