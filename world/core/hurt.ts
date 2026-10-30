import type { ServerCommand } from "#/world/core/commands"
import type { PlayerState } from "#/world/core/player-types"
import { derive } from "#/world/core/derive"
import { accept } from "#/world/core/accept"
import type { Transition } from "#/world/core/transition"

/** 被弾で座るのをやめ、全快から減ったときに自然回復の起点を更新する。 */
export function hurt(state: PlayerState, command: Extract<ServerCommand, { type: "hurt" }>, now: number): Transition {
  const hp = Math.max(0, state.hp - command.amount)
  return accept(
    { ...state, hp, hpAt: state.hp >= derive(state).maxHp ? now : state.hpAt, sitting: false },
    hp > 0 ? { type: "hurt", amount: command.amount, by: command.by, hp } : { type: "fell", by: command.by },
  )
}
