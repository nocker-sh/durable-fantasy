import { growCombatPlayer } from "#/world/core/grow-combat-player"
import { accept } from "#/world/core/accept"
import type { Transition } from "#/world/core/transition"
import type { ServerCommand } from "#/world/core/commands"
import type { PlayerState } from "#/world/core/player-types"

/** 分配先には経験値と成長時の回復を反映し、討伐者の消費や品は加えない。 */
export function share(state: PlayerState, command: Extract<ServerCommand, { type: "share" }>): Transition {
  const grown = growCombatPlayer(state, command.exp)

  return accept(grown.state, { type: "shared", monster: command.monster, exp: command.exp, level: grown.state.level, gained: grown.gained })
}
