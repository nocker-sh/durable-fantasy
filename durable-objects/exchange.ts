// The exchange (economy.md §5): one Durable Object for every town, so all players meet in one book.
// It holds what orders put up and what waits in each player's inbox; the map room moves goods and
// gold between it and the player's own object.
import { defineDurableState } from "void/durable"
import { book, cancel, emptyExchange, expire, place, takeInbox, type Candle, type ExchangeState, type Fill, type Inbox, type Order } from "#/world/core/exchange.ts"

export const Exchange = defineDurableState({
  initialState: { ex: emptyExchange() as ExchangeState },
  methods: {
    /** Put up an order whose goods or gold the room has already taken from the player. */
    place(context, o: { owner: string; name: string; side: "buy" | "sell"; symbol: string; price: number; qty: number; market?: boolean; by?: string }): { order: Order | null; fills: Fill[] } {
      const now = Date.now()
      const r = place(expire(context.state.ex, now), o, now)
      context.state.ex = r.state
      return { order: r.order, fills: r.fills }
    },
    cancel(context, owner: string, id: string): boolean {
      const next = cancel(expire(context.state.ex, Date.now()), owner, id)
      if (!next) return false
      context.state.ex = next
      return true
    },
    /** Hand over a player's inbox (emptying it); `putBack` if they could not carry it. */
    takeInbox(context, owner: string): Inbox {
      const r = takeInbox(expire(context.state.ex, Date.now()), owner)
      context.state.ex = r.state
      return r.inbox
    },
    putBack(context, owner: string, inbox: Inbox) {
      const box = (context.state.ex.inbox[owner] ??= { gold: 0, items: [] })
      box.gold += inbox.gold
      box.items.push(...inbox.items)
    },
    /** One symbol's book and daily prices, and a player's own orders and inbox. */
    look(context, symbol: string, owner: string): { book: ReturnType<typeof book>; history: Candle[]; mine: Order[]; inbox: Inbox; last: Order[] } {
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
          .slice(0, 8),
      }
    },
  },
})

export default Exchange
