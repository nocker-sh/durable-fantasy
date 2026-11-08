import { ITEMS } from "#/world/core/items/catalog"
import type { ItemId } from "#/world/core/items/catalog"
import { marketHash } from "#/world/core/market-hash"
import { target } from "#/world/core/target"

type Props = Readonly<{ stock: number; item: ItemId; shop: string; hour: number }>

/** Producers replenish current goods while residents consume a deterministic hourly share. */
export function hourOfStock(props: Props): number {
  const desired = target(props.item)
  const eaten = ITEMS[props.item].use ? 0.06 : 0.02
  const wobble = marketHash(props.hour, props.shop.length, props.item.length) - 0.5

  return Math.max(0, props.stock + (desired - props.stock) * 0.12 - desired * eaten * (1 + wobble))
}
