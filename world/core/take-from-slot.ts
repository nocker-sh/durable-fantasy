import type { Bag } from "#/world/core/bag-types"

/** Remove items from one slot. */
export function takeFromSlot(bag: Bag, index: number, count: number): Bag | null {
  const slot = bag[index]
  if (!slot || !Number.isInteger(count) || count <= 0 || count > slot.count) return null
  const next = [...bag]
  next[index] = slot.count === count ? null : { ...slot, count: slot.count - count }
  return next
}
