import { sameShopCommand } from "#/world/core/same-shop-command"
import { sameStacks } from "#/world/core/same-stacks"
import type { ShopQuote } from "#/world/core/shop-receipt-types"

/** 単価と店番の順序、売る品も受領記録へ結び付ける。 */
export function sameShopQuote(a: ShopQuote, b: ShopQuote): boolean {
  return (
    sameShopCommand(a, b) &&
    a.unitPrice === b.unitPrice &&
    a.keepers.length === b.keepers.length &&
    a.keepers.every((name, i) => name === b.keepers[i]) &&
    (a.type === "buy" || (b.type === "sell" && sameStacks([a.stack], [b.stack])))
  )
}
