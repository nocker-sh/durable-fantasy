import { isItemId } from "#/world/core/items/is-item-id"
import { isQuality } from "#/world/core/is-quality"
import type { Order, Inbox } from "#/world/core/exchange-types"
/** Refund stored orders without treating missing marks as newly made goods.
 * Older orders may predate an item's quality or use the former numeric symbol spelling.
 */
export function heldExchangeItem(order: Order, count: number): Inbox["items"][number] {
  const parts = order.symbol.split("@"),
    item = parts[0],
    qualityText = parts[1]
  const quality = qualityText === undefined ? undefined : Number(qualityText)
  if (!isItemId(item) || (quality !== undefined && !isQuality(quality))) throw new Error("Invalid stored exchange item")
  return { item, count, ...(quality !== undefined ? { q: quality } : {}), ...(order.by !== undefined ? { by: order.by } : {}) }
}
