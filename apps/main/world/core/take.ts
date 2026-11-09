import { batched } from "#/world/core/batched"
import { stockOf } from "#/world/core/stock-of"
import { moveStock } from "#/world/core/move-stock"
import { SLIPPAGE } from "#/world/core/market-rules"
import type { MarketState, Shelf, Taken } from "#/world/core/market-types"
import type { ItemId } from "#/world/core/items/catalog"
import type { Quality } from "#/world/core/items/kinds"

type Props = Readonly<{ state: MarketState; shop: string; item: ItemId; q: Quality; count: number; price: number; expected: number | undefined }>

/** Check the quoted price before stock, then remove goods only from a cloned market state. */
export function take(props: Props): Taken {
  if (props.expected !== undefined && Math.abs(props.price - props.expected) > Math.max(1, props.expected * SLIPPAGE)) return { ok: false, reason: "PRICE_CHANGED" }
  if (!batched(props.shop, props.item)) {
    if (stockOf(props.state, props.shop, props.item) < props.count) return { ok: false, reason: "SOLD_OUT" }
    return { ok: true, state: moveStock({ state: props.state, shop: props.shop, item: props.item, delta: -props.count }), price: props.price }
  }

  const have = props.state.shelf[props.shop]?.[props.item]?.[props.q] ?? 0
  if (have < props.count) return { ok: false, reason: "SOLD_OUT" }

  const shelf: Shelf = structuredClone(props.state.shelf)
  const quantities = shelf[props.shop]?.[props.item]
  if (!quantities) throw new TypeError("Reserved batch shelf is missing")
  quantities[props.q] -= props.count

  return { ok: true, state: { ...props.state, shelf }, price: props.price }
}
