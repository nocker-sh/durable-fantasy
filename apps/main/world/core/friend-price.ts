import { friendDiscount } from "#/world/core/friend-discount"

/** 値引き後も最低価格を保ち、通貨の単位に丸める。 */
export function friendPrice(price: number, friend: number): number {
  return Math.max(1, Math.round(price * (1 - friendDiscount(friend))))
}
