import { bulkStockPrice } from "#/world/core/bulk-stock-price"
import { stockOf } from "#/world/core/stock-of"
import type { ItemId } from "#/world/core/items/catalog"
import type { Quality } from "#/world/core/items/kinds"
import type { MarketState } from "#/world/core/market-types"
type Props = Readonly<{ state: MarketState; shop: string; item: ItemId; q: Quality; by: string | undefined; count?: number }>
/** What this shop asks per one now, for `count` bought together (one when not given). */
export function stockPrice(props: Props): number {
  return bulkStockPrice({ item: props.item, q: props.q, by: props.by, stock: stockOf(props.state, props.shop, props.item), count: props.count === undefined ? 1 : props.count })
}
