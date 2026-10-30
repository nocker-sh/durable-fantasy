import { MAX_LEVEL } from "#/world/core/growth-rules"

/** 次のレベルまでに必要な経験値。上限では蓄積しない。 */
export function expToNext(level: number): number {
  if (level >= MAX_LEVEL) return 0

  return Math.round(9 * level ** 2.1 + 20 * level)
}
