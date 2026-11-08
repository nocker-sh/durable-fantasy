import type { Bag } from "#/world/core/bag-types"
import { ITEMS } from "#/world/core/items/catalog"
import { isSlot } from "#/world/core/is-slot"
import { sameKind } from "#/world/core/same-kind"

/** Drag one slot onto another: top up a matching stack that has room, otherwise swap. */
export function moveSlot(bag: Bag, from: number, to: number): Bag | null {
  if (!isSlot(bag, from) || !isSlot(bag, to)) return null
  const source = bag[from]
  if (!source) return null
  if (from === to) return bag
  const target = bag[to]
  const next = [...bag]
  const put = target && sameKind(target, source) ? Math.min(source.count, ITEMS[source.item].stack - target.count) : 0
  if (target && put > 0) {
    next[to] = { ...target, count: target.count + put }
    next[from] = source.count === put ? null : { ...source, count: source.count - put }
    return next
  }
  next[to] = source
  next[from] = target
  return next
}
