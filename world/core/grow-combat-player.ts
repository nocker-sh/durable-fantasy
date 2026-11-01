import { gainExp } from "#/world/core/gain-exp"
import { derive } from "#/world/core/derive"
import { MAX_LEVEL } from "#/world/core/growth-rules"
import type { PlayerState } from "#/world/core/player-types"

/** 討伐者と分配先は、レベルが上がったときだけ HP と SP を全快する。上限の Lv で捨てる経験値は受け取った量に数えない。 */
export function growCombatPlayer(state: PlayerState, exp: number): { state: PlayerState; gained: number; exp: number } {
  const grown = gainExp(state, exp)
  const next = { ...state, level: grown.level, exp: grown.exp, statPoints: grown.statPoints }
  if (grown.gained) {
    const derived = derive(next)
    next.hp = derived.maxHp
    next.sp = derived.maxSp
  }
  return { state: next, gained: grown.gained, exp: state.level >= MAX_LEVEL ? 0 : exp }
}
