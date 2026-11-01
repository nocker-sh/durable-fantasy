import { priceOf } from "#/world/core/price-of"
import { stockFactor } from "#/world/core/stock-factor"
import type { ItemId } from "#/world/core/items/catalog"
import type { Quality } from "#/world/core/items/kinds"

type Props = Readonly<{ item: ItemId; q: Quality; by: string | undefined; stock: number; count: number }>

/** The price per one when buying `count` together: each one is priced at the stock it leaves, averaged and rounded up. */
export function bulkStockPrice(props: Props): number {
  const count = Math.max(1, Math.floor(props.count))
  const base = priceOf(props.item, props.q, props.by)
  const total = Array.from({ length: count }, (_, index) => Math.max(1, Math.round(base * stockFactor(props.stock - index, props.item)))).reduce((sum, price) => sum + price, 0)
  return Math.max(1, Math.ceil(total / count))
}
