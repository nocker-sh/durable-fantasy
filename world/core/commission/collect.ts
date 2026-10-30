import { addItem } from "#/world/core/add-item"
import type { ServerCommand } from "#/world/core/commands"
import { commissionOf } from "#/world/core/commission-of"
import { sameCommissionOrders } from "#/world/core/same-commission-orders"
import { FRIEND } from "#/world/core/friendship-rules"
import { befriend } from "#/world/core/befriend"
import { ITEMS } from "#/world/core/items/catalog"
import type { PlayerState } from "#/world/core/player-types"
import { accept } from "#/world/core/accept"
import { reject } from "#/world/core/reject"
import type { Transition } from "#/world/core/transition"

/** 選択時の一覧を照合し、完成品が持てる場合だけ依頼を取り除く。 */
export function collect(state: PlayerState, command: Extract<ServerCommand, { type: "collect" }>, now: number): Transition {
  if (!sameCommissionOrders(state.orders, command.expectedOrders)) return reject("ORDER_CHANGED")
  const order = state.orders[command.index]
  const job = order && commissionOf(order.commission)
  if (!order || !job) return reject("NOT_READY")
  if (order.readyAt > now) return reject("NOT_READY")
  const made = ITEMS[job.output.item].made
  const bag = addItem({ bag: state.bag, item: job.output.item, count: job.output.count, mark: made ? { q: order.q, by: job.craftsman } : undefined })
  if (!bag) return reject("BAG_FULL")
  return accept(
    { ...state, bag, orders: state.orders.filter((_, i) => i !== command.index), friends: befriend(state.friends, job.craftsman, FRIEND.commission) },
    { type: "collected", item: job.output.item, count: job.output.count, q: made ? order.q : null, by: job.craftsman },
  )
}
