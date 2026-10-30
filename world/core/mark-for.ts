import { ITEMS } from "#/world/core/items/catalog"
import type { ItemId } from "#/world/core/items/catalog"
import type { Mark } from "#/world/core/bag-types"
import { usualMaker } from "#/world/core/usual-maker"

/** The mark a made thing gets when none is given: an ordinary one by its usual maker. */
export function markFor(item: ItemId, mark?: Partial<Mark>): Mark | undefined {
  if (!ITEMS[item].made) return undefined
  return { q: mark?.q ?? 1, by: mark?.by ?? usualMaker(item) }
}
