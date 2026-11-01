import { ITEMS } from "#/world/core/items/catalog"
import { QUALITY_PRICE } from "#/world/core/items/kinds"
import type { Stack } from "#/world/core/bag-types"

/** A shop's price for one, adjusted to the stack's quality: a poor make pays less, a fine one no more than the ordinary. */
export function buybackOf(price: number, stack: Pick<Stack, "item" | "q">): number {
  if (!ITEMS[stack.item].made) return price
  return Math.max(1, Math.floor(price * Math.min(1, QUALITY_PRICE[stack.q ?? 1])))
}
