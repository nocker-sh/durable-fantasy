import { orderFailure } from "#/world/core/order-failure"
import { createExchangePlacement } from "#/world/core/create-exchange-placement"
import { getMatchingOrders } from "#/world/core/get-matching-orders"
import { fillExchangeOrder } from "#/world/core/fill-exchange-order"
import { finishExchangeOrder } from "#/world/core/finish-exchange-order"
import type { ExchangeState, ExchangeOffer, Placed } from "#/world/core/exchange-types"

/** Goods or gold are already held; commit price/time-priority matching only to a fresh working copy. */
export function place(state: ExchangeState, offer: ExchangeOffer, now: number): Placed {
  const reason = orderFailure(offer)
  if (reason) throw new Error(reason === "NOT_SELLABLE" ? "Invalid exchange symbol" : "Invalid exchange order")
  const placement = createExchangePlacement(state, offer, now)
  for (const other of getMatchingOrders(placement.state, offer, now)) {
    if (placement.order.left === 0) break
    if (!fillExchangeOrder(placement, other)) break
  }
  return finishExchangeOrder(placement)
}
