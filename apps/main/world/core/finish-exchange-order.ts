import { giveBackOrder } from "#/world/core/give-back-order"
import { creditExchangeInbox } from "#/world/core/credit-exchange-inbox"
import type { ExchangePlacement, Placed } from "#/world/core/exchange-types"

/** Keep residual limit orders, return residual market goods, and refund the buyer's unused escrow after reserving any limit remainder. */
export function finishExchangeOrder(placement: ExchangePlacement): Placed {
  placement.state.orders = placement.state.orders.filter((order) => order.left > 0)
  if (placement.order.left > 0) {
    if (!placement.offer.market) placement.state.orders.push(placement.order)
    else if (placement.offer.side === "sell") giveBackOrder(placement.state, placement.order)
  }
  if (placement.offer.side === "buy") {
    const refund = placement.budget - (placement.offer.market ? 0 : placement.order.price * placement.order.left)
    if (refund > 0) creditExchangeInbox({ inbox: placement.state.inbox, owner: placement.offer.owner, gold: refund })
  }
  return { state: placement.state, order: placement.order.left > 0 && !placement.offer.market ? placement.order : null, fills: placement.fills }
}
