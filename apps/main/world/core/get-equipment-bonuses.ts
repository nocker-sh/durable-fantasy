import { SLOTS } from "#/world/core/items/kinds"
import { ITEMS } from "#/world/core/items/catalog"
import type { Build, EquipmentBonuses } from "#/world/core/stats-types"

/** 各装備の補正を、同じ枠の順序で一度ずつ合計する。 */
export function getEquipmentBonuses(equipment: Build["equipment"]): EquipmentBonuses {
  const bonuses: Record<string, number> = {}
  for (const slot of SLOTS) {
    const item = equipment[slot]
    const bonus = item ? ITEMS[item].equip?.bonus : undefined
    for (const entry of Object.entries(bonus ?? {})) bonuses[entry[0]] = (bonuses[entry[0]] ?? 0) + (entry[1] ?? 0)
  }
  return bonuses
}
