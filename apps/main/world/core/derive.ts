import { ITEMS } from "#/world/core/items/catalog"
import { getEquipmentBonuses } from "#/world/core/get-equipment-bonuses"
import { getEquippedStats } from "#/world/core/get-equipped-stats"
import { getEquipmentDefenseTotal } from "#/world/core/get-equipment-defense-total"
import { getDerivedStats } from "#/world/core/get-derived-stats"
import type { Build, Derived } from "#/world/core/stats-types"

/** 表示とルールで同じ装備補正・能力値の計算を共有する。 */
export function derive(build: Build): Derived {
  const bonuses = getEquipmentBonuses(build.equipment)
  const stats = getEquippedStats(build.stats, bonuses)
  const weapon = build.equipment.weapon

  return getDerivedStats({ build, stats, bonuses, weapon: weapon ? ITEMS[weapon].equip : undefined, armorDefense: getEquipmentDefenseTotal(build) })
}
