import type { Bag, Mark } from "#/world/core/bag-types"
import type { ItemId } from "#/world/core/items/catalog"
import { putStack } from "#/world/core/put-stack"
import { stackWithMark } from "#/world/core/stack-with-mark"
import { markFor } from "#/world/core/mark-for"

type Props = {
  bag: Bag
  item: ItemId
  count: number
  mark?: Partial<Mark>
}

/** Add items, topping up stacks of the same kind first, then filling empty slots in order. */
export function addItem(props: Props): Bag | null {
  return putStack(props.bag, stackWithMark(props.item, props.count, markFor(props.item, props.mark)))
}
