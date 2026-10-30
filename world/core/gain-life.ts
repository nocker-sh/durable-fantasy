import type { LifeExp } from "#/world/core/life-types"
import { LIFE_TOTAL_CAP, LIFE_CAP } from "#/world/core/life-rules"
import { lifeLevel } from "#/world/core/life-level"
import { lifeTotal } from "#/world/core/life-total"
import { lifeExpAt } from "#/world/core/life-exp-at"
import type { Skill } from "#/world/core/items/kinds"

/**
 * Add experience to one skill. It stops at the end of the level it is on when another level would
 * pass the skill's cap or the ceiling for all of them together.
 */
export function gainLife(life: LifeExp, skill: Skill, amount: number): { life: LifeExp; level: number; up: boolean } {
  const before = life[skill] ?? 0
  const lv = lifeLevel(before)
  const room = LIFE_TOTAL_CAP - lifeTotal(life)
  const top = Math.min(LIFE_CAP, lv + Math.max(0, room))
  // at a level it cannot leave, experience fills up to just short of the next
  const limit = top >= LIFE_CAP ? lifeExpAt(LIFE_CAP) : lifeExpAt(top + 1) - 1
  const exp = Math.max(before, Math.min(limit, before + Math.max(0, Math.floor(amount))))
  const level = lifeLevel(exp)
  return { life: exp === before ? life : { ...life, [skill]: exp }, level, up: level > lv }
}
