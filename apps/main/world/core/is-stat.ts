import { STATS } from "#/world/core/growth-rules"
import type { Stat } from "#/world/core/growth-types"

/** 能力値の定義にある名前だけを受け入れる。 */
export function isStat(key: string): key is Stat {
  return STATS.some((stat) => stat === key)
}
