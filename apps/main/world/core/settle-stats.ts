import { derive } from "#/world/core/derive"
import { accept } from "#/world/core/accept"
import type { Transition } from "#/world/core/transition"
import type { GameEvent } from "#/world/core/commands"
import type { PlayerState } from "#/world/core/player-types"

/** Keep HP and SP within the maximums after equipment changes them. */
export function settleStats(state: PlayerState, ...events: GameEvent[]): Transition {
  const d = derive(state)
  return accept({ ...state, hp: Math.min(state.hp, d.maxHp), sp: Math.min(state.sp, d.maxSp) }, ...events)
}
