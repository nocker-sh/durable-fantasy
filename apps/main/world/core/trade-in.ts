import { putStacks } from "#/world/core/put-stacks"
import type { ServerCommand } from "#/world/core/commands"
import type { PlayerState } from "#/world/core/player-types"
import { overWeight } from "#/world/core/over-weight"
import { accept } from "#/world/core/accept"
import { reject } from "#/world/core/reject"
import type { Transition } from "#/world/core/transition"

/** 全品を収納し、交換では品を渡す前の重さと比較する。受取りだけなら現在の状態を基準にする。 */
export function tradeIn(state: PlayerState, command: Extract<ServerCommand, { type: "trade-in" }>, before: PlayerState = state): Transition {
  const bag = putStacks(state.bag, command.stacks)
  if (!bag) return reject("BAG_FULL")

  const next = { ...state, bag, gold: state.gold + command.gold }
  if (overWeight(before, next)) return reject("TOO_HEAVY")

  return accept(next, { type: "traded-in", stacks: [...command.stacks], gold: command.gold })
}
