import { putStack } from "#/world/core/put-stack"
import { accept } from "#/world/core/accept"
import { reject } from "#/world/core/reject"
import type { Bag } from "#/world/core/bag-types"
import type { ServerCommand } from "#/world/core/commands"
import type { PlayerState } from "#/world/core/player-types"
import type { Transition } from "#/world/core/transition"

/** A delivery accepts every stack together; no partial inventory escapes a refused delivery. */
export function receiveItems(state: PlayerState, command: Extract<ServerCommand, { type: "receive" }>): Transition {
  const bag = command.items.reduce<Bag | null>((current, stack) => (current ? putStack(current, stack) : null), state.bag)
  if (!bag) return reject("BAG_FULL")

  return accept({ ...state, bag, gold: state.gold + command.gold }, { type: "received", gold: command.gold, items: command.items.reduce((count, stack) => count + stack.count, 0) })
}
