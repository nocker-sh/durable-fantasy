import type { Bag, Mark } from "#/world/core/bag-types"
import type { ItemId } from "#/world/core/items/catalog"
import { matches } from "#/world/core/matches"

type Props = {
  bag: Bag
  item: ItemId
  count: number
  mark?: Partial<Mark>
}

/** 後ろの枠から取り除き、全量を確保できた場合だけ新しい袋を返す。品質と作り手は指定時だけ絞る。 */
export function removeItem(props: Props): Bag | null {
  if (!Number.isInteger(props.count) || props.count <= 0) return null

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
  return remaining.count === 0 ? next : null
}
