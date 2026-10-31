import { putStacks } from "#/world/core/put-stacks"
import type { ServerCommand } from "#/world/core/commands"
import type { PlayerState } from "#/world/core/player-types"
import { carried } from "#/world/core/inventory-weight"
import { derive } from "#/world/core/derive"
import { accept } from "#/world/core/accept"
import { reject } from "#/world/core/reject"
import type { Transition } from "#/world/core/transition"

/** 全品が収まり、重量を満たしたときだけ受取りを確定する。 */
export function tradeIn(state: PlayerState, command: Extract<ServerCommand, { type: "trade-in" }>): Transition {
  const bag = putStacks(state.bag, command.stacks)
  if (!bag) return reject("BAG_FULL")

  const weight = carried({ bag, equipment: state.equipment })
  if (command.stacks.length && weight > derive(state).maxWeight) return reject("TOO_HEAVY")

  return accept({ ...state, bag, gold: state.gold + command.gold }, { type: "traded-in", stacks: [...command.stacks], gold: command.gold })
}
