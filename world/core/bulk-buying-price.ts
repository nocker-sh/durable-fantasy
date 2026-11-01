import { unitBuyingPrice } from "#/world/core/unit-buying-price"
import type { ItemId } from "#/world/core/items/catalog"

type Props = Readonly<{ item: ItemId; stock: number; rate: number; count: number }>

/** The price per one when selling `count` together: each one is priced at the stock it raises, averaged and rounded down. */
export function bulkBuyingPrice(props: Props): number {
  const count = Math.max(1, Math.floor(props.count))
  const total = Array.from({ length: count }, (_, index) => unitBuyingPrice({ item: props.item, stock: props.stock + index, rate: props.rate })).reduce((sum, price) => sum + price, 0)
  return Math.max(1, Math.floor(total / count))
}
