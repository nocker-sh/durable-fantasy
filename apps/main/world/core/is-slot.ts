import type { Bag } from "#/world/core/bag-types"

export function isSlot(bag: Bag, index: number): boolean {
  return Number.isInteger(index) && index >= 0 && index < bag.length
}
