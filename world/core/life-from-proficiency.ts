import { emptyLife } from "#/world/core/empty-life"
import { LIFE_TOTAL_CAP, LIFE_SKILLS, LIFE_CAP } from "#/world/core/life-rules"
import { lifeExpAt } from "#/world/core/life-exp-at"
import type { Skill } from "#/world/core/items/kinds"

/** An old save's proficiency (0–200) as a level, keeping the highest within the ceiling. */
export function lifeFromProficiency(old: Readonly<Partial<Record<Skill, number>>>): Record<Skill, number> {
  const life = emptyLife()
  const remaining = { levels: LIFE_TOTAL_CAP }
  const order = [...LIFE_SKILLS].sort((a, b) => (old[b] ?? 0) - (old[a] ?? 0))
  for (const s of order) {
    const p = old[s] ?? 0
    if (!p) continue
    const lv = Math.min(LIFE_CAP, 1 + Math.floor(p / 15), remaining.levels)
    remaining.levels -= lv
    life[s] = lifeExpAt(lv)
  }
  return life
}
