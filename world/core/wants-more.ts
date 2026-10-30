import { stockOf } from "#/world/core/stock-of"
import { target } from "#/world/core/target"
import type { ItemId } from "#/world/core/items/catalog"
import type { MarketState } from "#/world/core/market-types"
type Props = Readonly<{ state: MarketState; shop: string; item: ItemId; count: number }>
export function wantsMore(props: Props) {
  return stockOf(props.state, props.shop, props.item) + props.count <= target(props.item) * 3
}
