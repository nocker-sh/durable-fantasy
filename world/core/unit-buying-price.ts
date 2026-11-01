import { ITEMS } from "#/world/core/items/catalog"
import { MAX_SHOP_RATE } from "#/world/core/market-rules"
import { buybackRate } from "#/world/core/buyback-rate"
import { stockFactor } from "#/world/core/stock-factor"
import type { ItemId } from "#/world/core/items/catalog"

type Props = Readonly<{ item: ItemId; stock: number; rate: number }>

/** What a shop pays for one more at this stock: less when it is overstocked, never a premium when short. */
export function unitBuyingPrice(props: Props): number {
  const factor = Math.min(1, stockFactor(props.stock, props.item))
  return Math.max(1, Math.floor(ITEMS[props.item].price * buybackRate(props.item) * factor * Math.min(MAX_SHOP_RATE, props.rate)))
}
