import { ITEMS } from "#/world/core/items/catalog"
import type { ItemId } from "#/world/core/items/catalog"
import type { Quality } from "#/world/core/items/kinds"
import { traitOf } from "#/world/core/trait-of"

/** The qualities a maker's thing comes in at all. */
export function qualitiesOf(item: ItemId, by?: string): Quality[] {
  if (!ITEMS[item].made) return [1]
  const t = traitOf(item, by)
  const qualities: readonly Quality[] = [0, 1, 2, 3]
  return qualities.filter((q) => (t ? t.tiers[q] > 0 : q === 1))
}
