import { ITEMS } from "#/world/core/items/catalog"
import { isItemId } from "#/world/core/items/is-item-id"
import { sellable } from "#/world/core/items/sellable"
import { isQuality } from "#/world/core/is-quality"
import type { Symbol } from "#/world/core/exchange-types"

/** Fresh orders use the current tradable items and quality spelling; stored refunds follow their separate legacy contract. */
export function parseSymbol(key: string): Symbol | null {
  const parts = key.split("@"),
    item = parts[0],
    text = parts[1]
  if (!isItemId(item) || !sellable(item) || ITEMS[item].tool || parts[2] !== undefined) return null
  if (text === undefined) return ITEMS[item].made ? null : { item }
  if (!ITEMS[item].made || !/^[0-3]$/.test(text)) return null
  const quality = Number(text)
  if (!isQuality(quality)) return null
  return { item, q: quality }
}
