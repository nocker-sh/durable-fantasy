import { putStacks } from "#/world/core/put-stacks"
import { accept } from "#/world/core/accept"
import { reject } from "#/world/core/reject"
import type { ServerCommand } from "#/world/core/commands"
import type { PlayerState } from "#/world/core/player-types"
import type { Transition } from "#/world/core/transition"

/** A delivery accepts every stack together; no partial inventory escapes a refused delivery. */
export function receiveItems(state: PlayerState, command: Extract<ServerCommand, { type: "receive" }>): Transition {
  const bag = putStacks(state.bag, command.items)
  if (!bag) return reject("BAG_FULL")

  return accept({ ...state, bag, gold: state.gold + command.gold }, { type: "received", gold: command.gold, items: command.items.reduce((count, stack) => count + stack.count, 0) })
}
