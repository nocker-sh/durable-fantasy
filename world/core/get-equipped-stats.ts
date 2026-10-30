import { STATS } from "#/world/core/growth-rules"
import type { Stats } from "#/world/core/growth-types"
import type { EquipmentBonuses } from "#/world/core/stats-types"

/** 振った能力値を変えず、装備補正を加えた別の記録を返す。 */
export function getEquippedStats(base: Stats, bonuses: EquipmentBonuses): Stats {
  const stats = { ...base }
  for (const stat of STATS) stats[stat] += bonuses[stat] ?? 0

  return stats
}
