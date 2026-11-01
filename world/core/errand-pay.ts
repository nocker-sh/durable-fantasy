import { ITEMS } from "#/world/core/items/catalog"
import { cheapestShopPrice } from "#/world/core/cheapest-shop-price"
import type { ItemId } from "#/world/core/items/catalog"

/**
 * 持込みの報酬は、どの店でいちばん安く買えるとき（閉店前の値引き・在庫の多いとき・なじみの値引き）よりも
 * 少なくし、購入して渡すだけでは利益を出さない。店にない品は定価を基準にする（economy.md §6.1）。
 */
export function errandPay(item: ItemId, count: number): number {
  const unit = cheapestShopPrice(item) ?? ITEMS[item].price
  return Math.floor(unit * count * 0.9)
}
