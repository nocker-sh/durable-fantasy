import { lifeToNext } from "#/world/core/life-to-next"
import { lifeThresholds } from "#/world/core/life-thresholds"

/** Experience it takes to stand at a level from nothing. */
export function lifeExpAt(level: number): number {
  const cached = lifeThresholds[level]
  if (cached !== undefined) return cached
  const sum = { level: 0, exp: 0 }
  while (sum.level < level) {
    sum.exp += lifeToNext(sum.level)
    sum.level++
  }
  return sum.exp
}
