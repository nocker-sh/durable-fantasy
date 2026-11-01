import { bulkBuyingPrice } from "#/world/core/bulk-buying-price"
import { stockOf } from "#/world/core/stock-of"
import type { ItemId } from "#/world/core/items/catalog"
import type { MarketState } from "#/world/core/market-types"
type Props = Readonly<{ state: MarketState; shop: string; item: ItemId; rate?: number; count?: number }>
/** What this shop pays per one now, for `count` sold together (one when not given). */
export function buyingPrice(props: Props): number {
  return bulkBuyingPrice({
    item: props.item,
    stock: stockOf(props.state, props.shop, props.item),
    rate: props.rate === undefined ? 1 : props.rate,
    count: props.count === undefined ? 1 : props.count,
  })
}
