import { ITEMS } from "#/world/core/items/catalog"
import type { ItemId } from "#/world/core/items/catalog"

/** 持込みの報酬は店の売価より少なくし、購入して渡すだけでは利益を出さない。 */
export function errandPay(item: ItemId, count: number): number {
  return Math.floor(ITEMS[item].price * count * 0.9)
}
