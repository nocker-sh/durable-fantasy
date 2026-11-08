import { START_STAT } from "#/world/core/growth-rules"
import type { Stats } from "#/world/core/growth-types"

/** 初期能力値を独立したオブジェクトで返す。 */
export function startingStats(): Stats {
  return { vit: START_STAT, mnd: START_STAT, str: START_STAT, dex: START_STAT, int: START_STAT, fth: START_STAT }
}
