import { LIFE_FINAL } from "#/world/core/life-rules"
import { lifeToNext } from "#/world/core/life-to-next"

// 最終レベルの経験値表示に使う、次のしきい値まで含める。
const thresholds = [0]
for (const level of Array.from({ length: LIFE_FINAL + 1 }, (_, index) => index)) {
  thresholds.push(thresholds[level] + lifeToNext(level))
}
export const lifeThresholds: readonly number[] = Object.freeze(thresholds)
