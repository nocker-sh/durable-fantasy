import { MAX_DAYS, EXCHANGE_DAY_MS } from "#/world/core/exchange-rules"
import type { ExchangeState, ExchangeOffer, ExchangePlacement, Order } from "#/world/core/exchange-types"
export function createExchangePlacement(state: ExchangeState, offer: ExchangeOffer, now: number): ExchangePlacement {
  const working: ExchangeState = structuredClone(state)
  const order: Order = {
    id: `o${++working.seq}`,
    owner: offer.owner,
    name: offer.name,
    side: offer.side,
    symbol: offer.symbol,
    price: offer.price,
    left: offer.qty,
    at: now,
    expires: now + MAX_DAYS * EXCHANGE_DAY_MS,
    ...(offer.by ? { by: offer.by } : {}),
  }
  return { state: working, offer, order, now, fills: [], budget: offer.side === "buy" ? offer.price * offer.qty : 0 }
}
