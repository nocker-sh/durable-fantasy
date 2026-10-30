import type { Bag, Stack } from "#/world/core/bag-types"
import { ITEMS } from "#/world/core/items/catalog"
import { sameKind } from "#/world/core/same-kind"

/** Put a stack into a bag as it is (a worn tool keeps its wear); null when there is no room. */
export function putStack(bag: Bag, stack: Stack): Bag | null {
  if (!Number.isInteger(stack.count) || stack.count <= 0) return null

  const limit = ITEMS[stack.item].stack
  const next = [...bag]
  const remaining = { count: stack.count }
  const indices = [...next.keys()]
  const order = [...indices.filter((index) => next[index]), ...indices.filter((index) => !next[index])]
  for (const index of order) {
    if (remaining.count <= 0) break
    const slot = next[index]
    if (slot && (!sameKind(slot, stack) || slot.dur !== stack.dur || slot.count >= limit)) continue
    const put = Math.min(remaining.count, slot ? limit - slot.count : limit)
    next[index] = { ...(slot ?? stack), count: (slot?.count ?? 0) + put }
    remaining.count -= put
  }
  return remaining.count === 0 ? next : null
}
