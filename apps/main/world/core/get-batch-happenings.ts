import type { Batch, Happening } from "#/world/core/market-types"
import type { ItemId } from "#/world/core/items/catalog"

type Props = Readonly<{ day: number; start: number; to: number; shop: string; item: ItemId; batch: Batch }>

/** Production and its delayed resident purchases retain their authored order at equal times. */
export function getBatchHappenings(props: Props): Happening[] {
  const happenings: Happening[] = []

  for (const entry of props.batch.at.entries()) {
    const time = props.day + entry[1] * 60_000
    if (time > props.start && time <= props.to) happenings.push({ t: time, shop: props.shop, item: props.item, kind: "production", count: props.batch.count, first: entry[0] === 0 })
    const eaten = props.batch.eaten
    const consumedAt = time + (eaten?.after ?? 0) * 60_000
    if (eaten && consumedAt > props.start && consumedAt <= props.to) happenings.push({ t: consumedAt, shop: props.shop, item: props.item, kind: "consumption", count: eaten.count })
  }

  return happenings
}
