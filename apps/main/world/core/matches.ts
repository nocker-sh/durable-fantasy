import type { Stack, Mark } from "#/world/core/bag-types"
import type { ItemId } from "#/world/core/items/catalog"

/** Is this stack the item (and, when given, of this quality and maker)? */
export function matches(slot: Stack | null, item: ItemId, mark?: Partial<Mark>): slot is Stack {
  if (slot?.item !== item) return false
  if (mark?.q !== undefined && slot.q !== mark.q) return false
  if (mark?.by !== undefined && slot.by !== mark.by) return false
  return true
}
