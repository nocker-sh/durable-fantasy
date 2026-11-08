import { ITEMS } from "#/world/core/items/catalog"
import { QUALITY_EFFECT } from "#/world/core/items/kinds"
import type { ItemId } from "#/world/core/items/catalog"
import type { Quality } from "#/world/core/items/kinds"
import { traitOf } from "#/world/core/trait-of"

/** What one of these does, by its quality and maker. */
export function effectOf(item: ItemId, q: Quality = 1, by?: string): { hp: number; sp: number; stamina: number; full: number; warm: number; focus: number } {
  const use = ITEMS[item].use ?? {}
  const t = traitOf(item, by)
  const k = (ITEMS[item].made ? QUALITY_EFFECT[q] : 1) * (t?.effect ?? 1)
  return {
    hp: Math.round((use.hp ?? 0) * k),
    sp: Math.round((use.sp ?? 0) * k + (t?.sp ?? 0)),
    stamina: Math.round((use.stamina ?? 0) * k + (t?.stamina ?? 0)),
    full: use.full ?? 0,
    focus: Math.round((use.focus ?? 0) * (ITEMS[item].made ? QUALITY_EFFECT[q] : 1)),
    warm: Math.round((use.warm ?? 0) * (ITEMS[item].made ? QUALITY_EFFECT[q] : 1) + (t?.warm ?? 0)),
  }
}
