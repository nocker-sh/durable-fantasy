import type { ItemId } from "#/world/core/items/catalog"
import type { Quality } from "#/world/core/items/kinds"
import { priceOf } from "#/world/core/price-of"

type Props = Readonly<{ item: ItemId; q: Quality; by: string | undefined; toClose: number | null; isBatched: boolean }>

/** Only prepared batches receive a closing-time discount; kept goods retain their ordinary price. */
export function priceNow(props: Props): number {
  const base = priceOf(props.item, props.q, props.by)

  if (!props.isBatched || props.toClose === null || props.toClose > 60) return base

  return Math.max(1, Math.round(base * (props.toClose <= 30 ? 0.7 : 0.9)))
}
