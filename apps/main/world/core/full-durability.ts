import { ITEMS } from "#/world/core/items/catalog"
import { QUALITY_EFFECT } from "#/world/core/items/kinds"
import type { ItemId } from "#/world/core/items/catalog"
import type { Quality } from "#/world/core/items/kinds"

/** 品質に応じた新品の道具の耐久値。道具以外には付けない。 */
export function fullDurability(item: ItemId, quality: Quality = 1): number | undefined {
  const tool = ITEMS[item].tool
  if (!tool) return undefined

  return Math.round(tool.durability * QUALITY_EFFECT[quality])
}
