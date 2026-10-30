import { SHOPS } from "#/world/core/shops"
import { usualMaker } from "#/world/core/usual-maker"
import type { ItemId } from "#/world/core/items/catalog"
import type { ShopDefinition, ShopId } from "#/world/core/shop-types"

/** Use the counter's named maker when present, otherwise the item's usual maker. */
export function makerAt(shop: ShopId, item: ItemId) {
  const definition: ShopDefinition = SHOPS[shop]
  return definition.makers?.[item] ?? usualMaker(item)
}
