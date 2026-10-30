import type { Skill } from "#/world/core/items/kinds"

/** 新しい生活スキルの経験値を独立した記録で返す。 */
export function emptyLife(): Record<Skill, number> {
  return { woodcutting: 0, fishing: 0, foraging: 0, cooking: 0, alchemy: 0, carpentry: 0, smithing: 0, tailoring: 0 }
}
