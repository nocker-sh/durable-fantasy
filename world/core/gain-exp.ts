import { expToNext } from "#/world/core/exp-to-next"
import { MAX_LEVEL } from "#/world/core/growth-rules"
import type { Progress } from "#/world/core/growth-types"
import { pointsForLevel } from "#/world/core/points-for-level"

/** 到達したレベル分のポイントを加え、上限で余剰経験値を捨てる。 */
export function gainExp(progress: Progress, amount: number): Progress & { gained: number } {
  const advanced = { ...progress, exp: progress.exp + Math.max(0, Math.floor(amount)), gained: 0 }

  while (advanced.level < MAX_LEVEL && advanced.exp >= expToNext(advanced.level)) {
    advanced.exp -= expToNext(advanced.level)
    advanced.level++
    advanced.gained++
    advanced.statPoints += pointsForLevel(advanced.level)
  }
  if (advanced.level >= MAX_LEVEL) advanced.exp = 0

  return { level: advanced.level, exp: advanced.exp, statPoints: advanced.statPoints, gained: advanced.gained }
}
