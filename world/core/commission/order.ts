import { removeItem } from "#/world/core/remove-item"
import type { Bag } from "#/world/core/bag-types"
import type { ServerCommand } from "#/world/core/commands"
import { MAX_ORDERS } from "#/world/core/commission-rules"
import { commissionOf } from "#/world/core/commission-of"
import { commissionQuality } from "#/world/core/commission-quality"
import { friendPrice } from "#/world/core/friend-price"
import { ITEMS } from "#/world/core/items/catalog"
import type { PlayerState } from "#/world/core/player-types"
import { accept } from "#/world/core/accept"
import { reject } from "#/world/core/reject"
import type { Transition } from "#/world/core/transition"

/** 共通の回復と行動不能の判定後に呼び、全材料を渡せるときだけ依頼と代金を確定する。 */
export function order(state: PlayerState, command: Extract<ServerCommand, { type: "order" }>, now: number): Transition {
  const job = commissionOf(command.commission)
  if (!job) return reject("NOT_SOLD_HERE")
  if (state.orders.length >= MAX_ORDERS) return reject("TOO_MANY_ORDERS")
  const fee = friendPrice(job.fee, state.friends[job.craftsman] ?? 0)
  if (state.gold < fee) return reject("NO_GOLD")
  const bag = job.inputs.reduce<Bag | null>((remaining, input) => remaining && removeItem({ bag: remaining, item: input.item, count: input.count }), state.bag)
  if (!bag) return reject("MISSING_INPUTS")
  const readyAt = now + job.minutes * 60_000
  const q = ITEMS[job.output.item].made ? commissionQuality(job.craftsman, job.output.item, command.roll) : 1
  return accept({ ...state, bag, gold: state.gold - fee, orders: [...state.orders, { commission: job.id, readyAt, q }] }, { type: "ordered", commission: job.id, readyAt })
}
