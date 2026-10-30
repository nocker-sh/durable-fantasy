import type { ExchangeState } from "#/world/core/exchange-types"
type Props = Readonly<{ state: ExchangeState; symbol: string; side: "buy" | "sell"; depth: number }>

/** Aggregate only by price and preserve the existing side-specific order and slice semantics. */
export function getBookSide(props: Props): { price: number; qty: number }[] {
  const levels = new Map<number, number>()
  for (const order of props.state.orders) if (order.symbol === props.symbol && order.side === props.side) levels.set(order.price, (levels.get(order.price) ?? 0) + order.left)
  return [...levels]
    .map((entry) => ({ price: entry[0], qty: entry[1] }))
    .sort((first, second) => (props.side === "buy" ? second.price - first.price : first.price - second.price))
    .slice(0, props.depth)
}
