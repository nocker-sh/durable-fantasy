import { LIFE_SKILLS } from "#/world/core/life-rules"
import { lifeLevel } from "#/world/core/life-level"
import type { LifeExp } from "#/world/core/life-types"

export function lifeTotal(life: LifeExp): number {
  return LIFE_SKILLS.reduce((a, s) => a + lifeLevel(life[s] ?? 0), 0)
}
