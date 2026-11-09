import { MAX_OPEN_ORDERS } from "#/world/core/exchange-rules"
import type { Order } from "#/world/core/exchange-types"

/** Whether one player's own orders still on the board already fill what a player may keep there (economy.md §5). */
export function atOrderLimit(mine: readonly Pick<Order, "expires">[], now: number): boolean {
  return mine.filter((order) => order.expires > now).length >= MAX_OPEN_ORDERS
}
