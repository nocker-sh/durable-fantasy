import { ITEMS } from "#/world/core/items/catalog"
import type { ItemId } from "#/world/core/items/catalog"
export function sellPrice(id: ItemId): number {
  return Math.max(1, Math.floor(ITEMS[id].price / 2))
}
