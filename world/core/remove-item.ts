import type { Bag, Mark } from "#/world/core/bag-types"
import type { ItemId } from "#/world/core/items/catalog"
import { countItem } from "#/world/core/count-item"
import { matches } from "#/world/core/matches"

type Props = {
  bag: Bag
  item: ItemId
  count: number
  mark?: Partial<Mark>
}

/** Remove items (of any quality and maker unless given), taking from the last stacks first. */
export function removeItem(props: Props): Bag | null {
  if (!Number.isInteger(props.count) || props.count <= 0) return null
  if (countItem(props.bag, props.item, props.mark) < props.count) return null

  const next = [...props.bag]
  const remaining = { count: props.count }
  for (const index of [...next.keys()].reverse()) {
    if (remaining.count <= 0) break
    const slot = next[index]
    if (!matches(slot, props.item, props.mark)) continue
    const take = Math.min(remaining.count, slot.count)
    next[index] = slot.count === take ? null : { ...slot, count: slot.count - take }
    remaining.count -= take
  }
  return next
}
