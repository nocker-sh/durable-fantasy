import { ITEMS } from "#/world/core/items/catalog"
import type { ItemId } from "#/world/core/items/catalog"
import { MAKERS } from "#/world/core/makers"
import { marketHash } from "#/world/core/market-hash"
import { batchQuality } from "#/world/core/batch-quality"

type Props = Readonly<{ item: ItemId; by: string; count: number; seed: number }>

/** Each unit receives a repeatable quality from its maker's weights and production time. */
export function splitBatch(props: Props): [number, number, number, number] {
  const quantities: [number, number, number, number] = [0, 0, 0, 0]
  if (!ITEMS[props.item].made) return [0, props.count, 0, 0]

  const weights: readonly [number, number, number, number] = MAKERS[props.by]?.[props.item]?.tiers ?? [0, 1, 0, 0]
  const total = weights.reduce((sum, weight) => sum + weight, 0) || 1

  for (const index of Array.from({ length: Math.max(0, Math.ceil(props.count)) }, (_value, index) => index)) {
    quantities[batchQuality({ weights, draw: marketHash(props.seed, index) * total })]++
  }

  return quantities
}
