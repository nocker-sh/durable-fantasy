import { SHOPS } from "#/world/core/shops"
import { batched } from "#/world/core/batched"
import { sellable } from "#/world/core/items/sellable"
import type { ItemId } from "#/world/core/items/catalog"
import type { ShopDefinition, ShopId } from "#/world/core/shop-types"

/**
 * Whether this counter buys the item at all (economy.md §4.1): the buyer takes anything sellable, other
 * shops only what they keep on the shelf or name as what they take in. What comes out of a shop's own
 * batches is made fresh and is not bought back.
 */
export function shopTakes(shop: ShopId, item: ItemId): boolean {
  const definition: ShopDefinition = SHOPS[shop]
  if (!sellable(item) || batched(shop, item)) return false
  if (definition.kind === "buyer") return true
  return definition.stock.includes(item) || (definition.takes ?? []).includes(item)
}
