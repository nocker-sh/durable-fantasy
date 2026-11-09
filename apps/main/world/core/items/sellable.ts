import { ITEMS } from "#/world/core/items/catalog"
import type { ItemId } from "#/world/core/items/catalog"
export function sellable(id: ItemId): boolean {
  return ITEMS[id].kind !== "key"
}
