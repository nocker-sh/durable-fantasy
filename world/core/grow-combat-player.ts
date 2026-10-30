import { gainExp } from "#/world/core/gain-exp"
import { derive } from "#/world/core/derive"
import type { PlayerState } from "#/world/core/player-types"

/** 討伐者と分配先は、レベルが上がったときだけ HP と SP を全快する。 */
export function growCombatPlayer(state: PlayerState, exp: number): { state: PlayerState; gained: number } {
  const grown = gainExp(state, exp)
  const next = { ...state, level: grown.level, exp: grown.exp, statPoints: grown.statPoints }
  if (grown.gained) {
    const derived = derive(next)
    next.hp = derived.maxHp
    next.sp = derived.maxSp
  }
  return { state: next, gained: grown.gained }
}
