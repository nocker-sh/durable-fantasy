import { consumeBatch } from "#/world/core/consume-batch"
import { splitBatch } from "#/world/core/split-batch"
import type { ItemId } from "#/world/core/items/catalog"
import type { Quality } from "#/world/core/items/kinds"
import type { Happening, Shelf } from "#/world/core/market-types"

type Props = Readonly<{ shelf: Shelf; happening: Happening; makerOf: (shop: string, item: ItemId) => string }>

/** Mutate only restock's owned shelf; the first production discards yesterday's remaining goods. */
export function applyMarketHappening(props: Props): void {
  const happening = props.happening
  const row = (props.shelf[happening.shop] ??= {})
  const quantities: [number, number, number, number] = row[happening.item] ?? [0, 0, 0, 0]

  if (happening.kind === "consumption") consumeBatch({ quantities, count: happening.count })
  else {
    const fresh = splitBatch({ item: happening.item, by: props.makerOf(happening.shop, happening.item), count: happening.count, seed: happening.t / 60_000 })
    const qualities: readonly Quality[] = [0, 1, 2, 3]
    for (const quality of qualities) quantities[quality] = (happening.first ? 0 : quantities[quality]) + fresh[quality]
  }

  row[happening.item] = quantities
}
