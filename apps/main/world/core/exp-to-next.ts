import { MAX_LEVEL } from "#/world/core/growth-rules"

/** 次のレベルまでに必要な経験値。上限では蓄積しない。 */
export function expToNext(level: number): number {
  if (level >= MAX_LEVEL) return 0

  // five times the first curve: the top creatures give much, and L12/L22 gear should take hours, not minutes (decisions.md)
  return Math.round(45 * level ** 2.1 + 100 * level)
}
