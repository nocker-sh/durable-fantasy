import type { ItemId } from "#/world/core/items/catalog"
import type { MonsterKind } from "#/world/core/monster-types"

/** 品目ごとに独立した抽選値を使い、足りない値では品を落とさない。 */
export function dropsOf(kind: MonsterKind, rolls: readonly number[]): ItemId[] {
  return kind.drops.flatMap((d, i) => ((rolls[i] ?? 1) < d.chance ? [d.item] : []))
}
