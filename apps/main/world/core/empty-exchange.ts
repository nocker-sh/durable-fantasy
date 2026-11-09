import type { ExchangeState } from "#/world/core/exchange-types"
export function emptyExchange(): ExchangeState {
  return { orders: [], inbox: {}, fees: 0, history: {}, seq: 0 }
}
