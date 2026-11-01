import { fullDurability } from "#/world/core/full-durability"
import type { Stack } from "#/world/core/bag-types"

/**
 * Whether a stack can go on the exchange as it is: a tool only while unworn, because the board trades
 * by item and quality and hands every tool over at its full durability (economy.md §5).
 */
export function exchangeReady(stack: Pick<Stack, "item" | "q" | "dur">): boolean {
  const full = fullDurability(stack.item, stack.q ?? 1)
  return full === undefined || stack.dur === full
}
