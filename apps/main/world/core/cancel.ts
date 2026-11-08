import { giveBackOrder } from "#/world/core/give-back-order"
import type { ExchangeState } from "#/world/core/exchange-types"
/** Take down an order: what it holds goes back to the owner's inbox (the listing fee does not). */
export function cancel(state: ExchangeState, owner: string, id: string): ExchangeState | null {
  const order = state.orders.find((candidate) => candidate.id === id && candidate.owner === owner)
  if (!order) return null
  const working: ExchangeState = structuredClone(state)
  giveBackOrder(working, order)
  working.orders = working.orders.filter((candidate) => candidate.id !== id)
  return working
}
