import { takeFromSlot } from "#/world/core/take-from-slot"
import { ITEMS } from "#/world/core/items/catalog"
import { accept } from "#/world/core/accept"
import { reject } from "#/world/core/reject"
import type { Command } from "#/world/core/commands"
import type { PlayerState } from "#/world/core/player-types"
import type { Transition } from "#/world/core/transition"

/** 持ち物の一枠から決めた数を捨てる。大事なものは捨てられない（game-system.md §5）。 */
export function discard(state: PlayerState, command: Extract<Command, { type: "discard" }>): Transition {
  const stack = state.bag[command.slot]
  if (!stack) return reject("EMPTY_SLOT")
  if (ITEMS[stack.item].kind === "key") return reject("NOT_DISCARDABLE")
  const bag = takeFromSlot(state.bag, command.slot, command.count)
  if (!bag) return reject("NOT_ENOUGH")
  return accept({ ...state, bag }, { type: "discarded", item: stack.item, count: command.count, ...(stack.by !== undefined ? { by: stack.by } : {}) })
}
