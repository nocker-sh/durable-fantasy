import { MAKERS } from "#/world/core/makers"
import { COMMISSION_QUALITIES, DEFAULT_COMMISSION_TIERS } from "#/world/core/commission-rules"
import type { ItemId } from "#/world/core/items/catalog"
import type { Quality } from "#/world/core/items/kinds"

/** Preserve the maker's weighted subtraction order, including the ordinary-quality fallback at the upper boundary. */
export function commissionQuality(craftsman: string, item: ItemId, roll: number): Quality {
  const weights = MAKERS[craftsman]?.[item]?.tiers ?? DEFAULT_COMMISSION_TIERS
  const total = weights.reduce((sum, weight) => sum + weight, 0)
  const draw = { remaining: roll * total }
  for (const quality of COMMISSION_QUALITIES) {
    if (draw.remaining < weights[quality]) return quality
    draw.remaining -= weights[quality]
  }
  return 1
}
