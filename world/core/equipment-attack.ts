import { ITEMS } from "#/world/core/items/catalog"
import { QUALITY_EFFECT } from "#/world/core/items/kinds"
import type { Quality } from "#/world/core/items/kinds"
import type { ItemId } from "#/world/core/items/catalog"

/** 品質は品ごとの基礎性能へ掛け、装備ごとに整数へ丸める。 */
export function equipmentAttack(item: ItemId, quality: Quality = 1): number {
  const definition = ITEMS[item]
  return Math.round((definition.equip?.atk ?? 0) * (definition.made ? QUALITY_EFFECT[quality] : 1))
}
