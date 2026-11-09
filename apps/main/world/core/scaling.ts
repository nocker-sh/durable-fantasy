import { GRADES } from "#/world/core/items/kinds"
import { STATS, START_STAT } from "#/world/core/growth-rules"
import type { Stats } from "#/world/core/growth-types"
import type { Equipment } from "#/world/core/items/types"

/** 能力補正は能力値ごとに整数へ丸め、武器の品質倍率を重ねない。 */
export function scaling(equipment: Equipment | undefined, stats: Stats): number {
  const attack = equipment?.atk,
    scale = equipment?.scale
  if (!attack || !scale) return 0

  return STATS.reduce((sum, stat) => {
    const grade = scale[stat]
    if (grade === undefined) return sum
    return sum + Math.floor((attack * GRADES[grade] * Math.max(0, stats[stat] - START_STAT)) / 20)
  }, 0)
}
