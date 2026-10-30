import { target } from "#/world/core/target"
import type { ItemId } from "#/world/core/items/catalog"
export function stockFactor(stock: number, item: ItemId): number {
  const ratio = stock / target(item)
  return 1 + 0.3 * Math.max(-1, Math.min(1, 1 - ratio))
}
