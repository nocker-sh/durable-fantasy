import { sellable } from "#/world/core/items/sellable"
import type { Bag } from "#/world/core/bag-types"
import type { ItemId } from "#/world/core/items/catalog"

/** 最初に現れる持ち物の順を保ち、取引できる品の種類だけを買取照会へ渡す。 */
export function getCarriedSellableItemIds(bag: Bag): ItemId[] {
  return [...new Set(bag.flatMap((stack) => (stack && sellable(stack.item) ? [stack.item] : [])))]
}
