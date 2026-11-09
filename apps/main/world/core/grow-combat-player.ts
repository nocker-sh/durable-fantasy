import { gainExp } from "#/world/core/gain-exp"
import { derive } from "#/world/core/derive"
import { expToNext } from "#/world/core/exp-to-next"
import type { PlayerState } from "#/world/core/player-types"

/** 討伐者と分配先は、レベルが上がったときだけ HP と SP を全快する。上限の Lv で捨てる経験値は受け取った量に数えない。 */
export function growCombatPlayer(state: PlayerState, exp: number): { state: PlayerState; gained: number; exp: number } {
  const grown = gainExp(state, exp)
  const spent = Array.from({ length: grown.gained }, (_, index) => expToNext(state.level + index)).reduce((total, amount) => total + amount, 0)
  const next = { ...state, level: grown.level, exp: grown.exp, statPoints: grown.statPoints }
  if (grown.gained) {
    const derived = derive(next)
    next.hp = derived.maxHp
    next.sp = derived.maxSp
  }
  return { state: next, gained: grown.gained, exp: Math.max(0, spent + grown.exp - state.exp) }
}
