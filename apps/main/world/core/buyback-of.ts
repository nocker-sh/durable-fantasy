import { ITEMS } from "#/world/core/items/catalog"
import { QUALITY_PRICE } from "#/world/core/items/kinds"
import { fullDurability } from "#/world/core/full-durability"
import type { Stack } from "#/world/core/bag-types"

/**
 * A shop's price for one, adjusted to the stack: a poor make pays less, a fine one no more than the ordinary,
 * and a worn tool only the share of its uses left (economy.md §4.1). A tool with no wear recorded counts as new.
 */
export function buybackOf(price: number, stack: Pick<Stack, "item" | "q" | "dur">): number {
  if (!ITEMS[stack.item].made) return price
  const made = price * Math.min(1, QUALITY_PRICE[stack.q ?? 1])
  const full = fullDurability(stack.item, stack.q ?? 1)
  if (!full || stack.dur === undefined) return Math.max(1, Math.floor(made))
  // a single division keeps whole results exact, so an unworn tool pays the plain made-goods price
  return Math.max(1, Math.floor((made * Math.min(full, Math.max(0, stack.dur))) / full))
}
