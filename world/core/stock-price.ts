import { priceOf } from "#/world/core/price-of"
import { stockFactor } from "#/world/core/stock-factor"
import { stockOf } from "#/world/core/stock-of"
import type { ItemId } from "#/world/core/items/catalog"
import type { Quality } from "#/world/core/items/kinds"
import type { MarketState } from "#/world/core/market-types"
type Props = Readonly<{ state: MarketState; shop: string; item: ItemId; q: Quality; by: string | undefined }>
export function stockPrice(props: Props): number {
  return Math.max(1, Math.round(priceOf(props.item, props.q, props.by) * stockFactor(stockOf(props.state, props.shop, props.item), props.item)))
}
