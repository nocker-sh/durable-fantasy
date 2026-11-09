import { isItemId } from "#/world/core/items/is-item-id"
import { isQuality } from "#/world/core/is-quality"
import { fullDurability } from "#/world/core/full-durability"
import type { Order, Inbox } from "#/world/core/exchange-types"
/** Refund stored orders without treating missing marks as newly made goods.
 * Older orders may predate an item's quality or use the former numeric symbol spelling.
 */
export function heldExchangeItem(order: Pick<Order, "symbol" | "by">, count: number): Inbox["items"][number] {
  const parts = order.symbol.split("@"),
    item = parts[0],
    qualityText = parts[1]
  const quality = qualityText === undefined ? undefined : Number(qualityText)
  if (!isItemId(item) || (quality !== undefined && !isQuality(quality))) throw new Error("Invalid stored exchange item")
  // a tool was listed unworn (exchange-ready.ts) and is handed over at its full durability
  const dur = fullDurability(item, quality ?? 1)
  return { item, count, ...(quality !== undefined ? { q: quality } : {}), ...(order.by !== undefined ? { by: order.by } : {}), ...(dur !== undefined ? { dur } : {}) }
}
