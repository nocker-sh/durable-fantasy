import { SLOTS } from "#/world/core/items/kinds"
import { equipmentDefense } from "#/world/core/equipment-defense"
import type { Build } from "#/world/core/stats-types"

/** 各装備で品質を丸めた防御力を、枠の順で合計する。 */
export function getEquipmentDefenseTotal(build: Build): number {
  return SLOTS.reduce((total, slot) => {
    const item = build.equipment[slot]
    return total + (item ? equipmentDefense(item, build.worn?.[slot]?.q) : 0)
  }, 0)
}
