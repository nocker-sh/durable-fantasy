import { deathPenalty } from "#/world/core/death-penalty"
import { expToNext } from "#/world/core/exp-to-next"
import { derive } from "#/world/core/derive"
import { accept } from "#/world/core/accept"
import { reject } from "#/world/core/reject"
import type { Transition } from "#/world/core/transition"
import type { PlayerState } from "#/world/core/player-types"

/** 戦闘不能のときだけ、復活時の HP と経験値の損失を確定する。 */
export function revive(state: PlayerState, now: number): Transition {
  if (state.hp > 0) return reject("NOT_FALLEN")
  const lost = Math.min(state.exp, deathPenalty(state.level, expToNext(state.level)))
  const hp = Math.max(1, Math.floor(derive(state).maxHp / 2))
  return accept({ ...state, hp, hpAt: now, sitting: false, exp: state.exp - lost }, { type: "revived", hp, lost })
}
