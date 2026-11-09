import { batched } from "#/world/core/batched"
import type { ItemId } from "#/world/core/items/catalog"
import type { Quality } from "#/world/core/items/kinds"
import type { MarketState, Shelf } from "#/world/core/market-types"

type Props = Readonly<{ state: MarketState; shop: string; item: ItemId; q: Quality; count: number }>

/** Restore a refused reservation to its batch shelf; kept goods are compensated separately. */
export function giveBack(props: Props): MarketState {
  if (!batched(props.shop, props.item)) return props.state

  const shelf: Shelf = structuredClone(props.state.shelf)
  const row = (shelf[props.shop] ??= {})
  const quantities: [number, number, number, number] = row[props.item] ?? [0, 0, 0, 0]
  quantities[props.q] += props.count
  row[props.item] = quantities

  return { ...props.state, shelf }
}
