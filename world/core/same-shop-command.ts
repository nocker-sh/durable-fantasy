import { sameStack } from "#/world/core/same-stack"
import type { ShopCommand } from "#/world/core/shop-receipt-types"

/** 買値の確認と、売るときに選んだ一枠の品質・消耗を含めて比較する。 */
export function sameShopCommand(a: ShopCommand, b: ShopCommand): boolean {
  if (a.type !== b.type || a.shop !== b.shop || a.count !== b.count) return false
  if (a.type === "buy") return b.type === "buy" && a.item === b.item && (a.q ?? 1) === (b.q ?? 1) && a.price === b.price

  return b.type === "sell" && a.slot === b.slot && sameStack(a.expectedStack, b.expectedStack)
}
