import { putStack } from "#/world/core/put-stack"
import type { ServerCommand } from "#/world/core/commands"
import type { PlayerState } from "#/world/core/player-types"
import { carried } from "#/world/core/inventory-weight"
import { derive } from "#/world/core/derive"
import { accept } from "#/world/core/accept"
import { reject } from "#/world/core/reject"
import type { Transition } from "#/world/core/transition"

/** 全品が収まり、重量を満たしたときだけ受取りを確定する。 */
export function tradeIn(state: PlayerState, command: Extract<ServerCommand, { type: "trade-in" }>): Transition {
  const incoming = { bag: state.bag }
  for (const stack of command.stacks) {
    const next = putStack(incoming.bag, stack)
    if (!next) return reject("BAG_FULL")
    incoming.bag = next
  }
  const weight = carried({ bag: incoming.bag, equipment: state.equipment })
  if (command.stacks.length && weight > derive(state).maxWeight) return reject("TOO_HEAVY")

  return accept({ ...state, bag: incoming.bag, gold: state.gold + command.gold }, { type: "traded-in", stacks: [...command.stacks], gold: command.gold })
}
