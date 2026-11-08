import { book } from "#/world/core/book"
import { expire } from "#/world/core/expire"
import type { ExchangeView } from "#/world/protocol"
import type { ExchangeContext } from "#/world/server/exchange-coordinator"

export function viewExchange(context: Pick<ExchangeContext, "state">, symbol: string, owner: string): ExchangeView {
  context.state.ex = expire(context.state.ex, Date.now())
  const ex = context.state.ex
  return {
    book: book(ex, symbol),
    history: ex.history[symbol] ?? [],
    mine: ex.orders.filter((o) => o.owner === owner),
    inbox: ex.inbox[owner] ?? { gold: 0, items: [] },
    // the sellers of this symbol, to choose a maker
    last: ex.orders
      .filter((o) => o.symbol === symbol && o.side === "sell")
      .sort((a, b) => a.price - b.price)
      .slice(0, 8)
      .map((o) => ({ id: o.id, name: o.name, side: o.side, symbol: o.symbol, price: o.price, left: o.left, at: o.at, expires: o.expires, ...(o.by !== undefined ? { by: o.by } : {}) })),
  }
}
