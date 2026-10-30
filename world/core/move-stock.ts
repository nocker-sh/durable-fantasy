import { target } from "#/world/core/target"
import type { ItemId } from "#/world/core/items/catalog"
import type { MarketState } from "#/world/core/market-types"
type Props = Readonly<{ state: MarketState; shop: string; item: ItemId; delta: number }>
/** Update only a cloned stock map; the original shelves and state retain their references. */
export function moveStock(props: Props): MarketState {
  const stock: NonNullable<MarketState["stock"]> = structuredClone(props.state.stock ?? {})
  const row = (stock[props.shop] ??= {})
  row[props.item] = Math.max(0, (row[props.item] ?? target(props.item)) + props.delta)
  return { ...props.state, stock }
}
