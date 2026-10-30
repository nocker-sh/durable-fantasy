import type { OrderIntent } from "#/world/core/exchange-types"

/** Buy slots do not identify an order; selling slots and the effective market flag do. */
export function sameIntent(first: OrderIntent, second: OrderIntent): boolean {
  return (
    first.side === second.side &&
    first.symbol === second.symbol &&
    first.price === second.price &&
    first.qty === second.qty &&
    !!first.market === !!second.market &&
    (first.side === "buy" || first.slot === second.slot)
  )
}
