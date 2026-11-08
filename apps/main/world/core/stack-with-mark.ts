import type { ItemId } from "#/world/core/items/catalog"
import type { Mark, Stack } from "#/world/core/bag-types"
import { fullDurability } from "#/world/core/full-durability"

/** 新しく作る品に品質・作り手と新品の耐久値を付ける。 */
export function stackWithMark(item: ItemId, count: number, mark: Mark | undefined): Stack {
  const dur = fullDurability(item, mark?.q)
  return { item, count, ...(mark ? { q: mark.q, by: mark.by } : {}), ...(dur !== undefined ? { dur } : {}) }
}
