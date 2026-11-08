import { getBookSide } from "#/world/core/get-book-side"
import type { ExchangeState } from "#/world/core/exchange-types"
export function book(state: ExchangeState, symbol: string, depth = 6): { bids: { price: number; qty: number }[]; asks: { price: number; qty: number }[] } {
  return { bids: getBookSide({ state, symbol, side: "buy", depth }), asks: getBookSide({ state, symbol, side: "sell", depth }) }
}
