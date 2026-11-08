import { giveBackOrder } from "#/world/core/give-back-order"
import type { ExchangeState } from "#/world/core/exchange-types"
/** Orders past their seven days go back to their owners. */
export function expire(state: ExchangeState, now: number): ExchangeState {
  if (!state.orders.some((order) => order.expires <= now)) return state
  const working: ExchangeState = structuredClone(state)
  for (const order of working.orders.filter((candidate) => candidate.expires <= now)) giveBackOrder(working, order)
  working.orders = working.orders.filter((order) => order.expires > now)
  return working
}
