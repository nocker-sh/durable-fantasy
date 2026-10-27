// Commission transitions, after apply's shared recovery and fallen-state guards.
import { addItem, removeItem, type Bag } from "./bag.ts"
import type { ServerCommand } from "./commands.ts"
import { MAX_ORDERS, commissionOf, commissionQuality } from "./commissions.ts"
import { FRIEND, befriend, friendPrice } from "./errands.ts"
import { ITEMS } from "./items.ts"
import type { PlayerState } from "./player.ts"
import { accept, reject, type Transition } from "./transition.ts"

export function order(state: PlayerState, command: Extract<ServerCommand, { type: "order" }>, now: number): Transition {
  const job = commissionOf(command.commission)
  if (!job) return reject("NOT_SOLD_HERE")
  if (state.orders.length >= MAX_ORDERS) return reject("TOO_MANY_ORDERS")
  const fee = friendPrice(job.fee, state.friends[job.craftsman] ?? 0)
  if (state.gold < fee) return reject("NO_GOLD")
  let bag: Bag = state.bag
  for (const { item, count } of job.inputs) {
    const next = removeItem(bag, item, count)
    if (!next) return reject("MISSING_INPUTS")
    bag = next
  }
  const readyAt = now + job.minutes * 60_000
  const q = ITEMS[job.output.item].made ? commissionQuality(job.craftsman, job.output.item, command.roll) : 1
  return accept({ ...state, bag, gold: state.gold - fee, orders: [...state.orders, { commission: job.id, readyAt, q }] }, { type: "ordered", commission: job.id, readyAt })
}

export function collect(state: PlayerState, command: Extract<ServerCommand, { type: "collect" }>, now: number): Transition {
  const order = state.orders[command.index]
  const job = order && commissionOf(order.commission)
  if (!order || !job) return reject("NOT_READY")
  if (order.readyAt > now) return reject("NOT_READY")
  const made = ITEMS[job.output.item].made
  const bag = addItem(state.bag, job.output.item, job.output.count, made ? { q: order.q, by: job.craftsman } : undefined)
  if (!bag) return reject("BAG_FULL")
  return accept(
    { ...state, bag, orders: state.orders.filter((_, i) => i !== command.index), friends: befriend(state.friends, job.craftsman, FRIEND.commission) },
    { type: "collected", item: job.output.item, count: job.output.count, q: made ? order.q : null, by: job.craftsman },
  )
}
