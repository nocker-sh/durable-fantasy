import { ITEMS } from "#/world/core/items/catalog"
import { stockFactor } from "#/world/core/stock-factor"
import { stockOf } from "#/world/core/stock-of"
import type { ItemId } from "#/world/core/items/catalog"
import type { MarketState } from "#/world/core/market-types"
type Props = Readonly<{ state: MarketState; shop: string; item: ItemId; rate?: number }>
export function buyingPrice(props: Props): number {
  const rate = props.rate === undefined ? 1 : props.rate
  return Math.max(1, Math.floor(ITEMS[props.item].price * stockFactor(stockOf(props.state, props.shop, props.item), props.item) * 0.45 * rate))
}
