import type { ExchangeState, ExchangeOffer } from "#/world/core/exchange-types"

/** Filter expiry and crossing prices before stable price/time priority; equal keys retain their authored queue order. */
export function getMatchingOrders(state: ExchangeState, offer: ExchangeOffer, now: number) {
  return state.orders
    .filter(
      (order) =>
        order.symbol === offer.symbol &&
        order.side !== offer.side &&
        order.expires > now &&
        (offer.side === "buy" ? offer.market || order.price <= offer.price : offer.market || order.price >= offer.price),
    )
    .sort((first, second) => (offer.side === "buy" ? first.price - second.price : second.price - first.price) || first.at - second.at)
}
