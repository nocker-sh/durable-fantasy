import { ITEMS } from "#/world/core/items/catalog"
import type { ItemId } from "#/world/core/items/catalog"
/** Cheap goods have a larger target stock than expensive equipment. */
export function target(item: ItemId): number {
  const price = ITEMS[item].price
  return price <= 10 ? 40 : price <= 40 ? 20 : price <= 150 ? 8 : 4
}
