import { getTradeOutGoods } from "#/world/core/get-trade-out-goods"
import type { ServerCommand } from "#/world/core/commands"
import type { PlayerState } from "#/world/core/player-types"
import { accept } from "#/world/core/accept"
import { reject } from "#/world/core/reject"
import type { Transition } from "#/world/core/transition"

/** 共通の回復・行動不能の判定後に、提示した品と所持金を引き渡す。 */
export function tradeOut(state: PlayerState, command: Extract<ServerCommand, { type: "trade-out" }>): Transition {
  const gold = command.offer.gold
  if (!Number.isInteger(gold) || gold < 0 || gold > state.gold) return reject("NO_GOLD")

  const outgoing = getTradeOutGoods(state.bag, command.offer.lots)
  if (!outgoing.ok) return reject(outgoing.reason)

  return accept({ ...state, bag: outgoing.bag, gold: state.gold - gold }, { type: "traded-out", stacks: outgoing.stacks, gold })
}
