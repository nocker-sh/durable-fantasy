// The exchange (economy.md §5): any player can put up anything, or ask for it, at a price. Orders
// meet by price, then by time; an order can be met in part; a market order takes what is there. What
// changes hands waits in each player's inbox until they collect it at the board. Fees take money out
// of the economy: 1% of an order's value to put it up, 3% of what a seller receives. Pure: the
// exchange Durable Object keeps the state and runs these one at a time.
import { ITEMS, type ItemId, type Quality } from "./items.ts"

export const LISTING_FEE = 0.01
export const TRADE_FEE = 0.03
export const MAX_DAYS = 7
const DAY = 86_400_000

/** What is traded: an item, and for made things its quality (makers are not separate symbols). */
export interface Symbol {
  item: ItemId
  q?: Quality
}
export const symbolKey = (s: Symbol) => (s.q === undefined ? s.item : `${s.item}@${s.q}`)
export function parseSymbol(key: string): Symbol | null {
  const [item, q] = key.split("@")
  if (!(item in ITEMS)) return null
  if (q === undefined) return ITEMS[item as ItemId].made ? null : { item: item as ItemId }
  const n = Number(q)
  return ITEMS[item as ItemId].made && [0, 1, 2, 3].includes(n) ? { item: item as ItemId, q: n as Quality } : null
}

export interface Order {
  id: string
  owner: string
  /** the name shown in the list (and a seller's maker, for made things) */
  name: string
  side: "buy" | "sell"
  symbol: string
  /** gold per one */
  price: number
  left: number
  at: number
  expires: number
  /** a sell order of a made thing: whose make it is */
  by?: string
}

/** What waits for a player at the board: gold, and things (with their maker for made things). */
export interface Inbox {
  gold: number
  items: { item: ItemId; count: number; q?: Quality; by?: string }[]
}

export interface Fill {
  symbol: string
  price: number
  qty: number
  buyer: string
  seller: string
  at: number
}

export interface Candle {
  day: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface ExchangeState {
  orders: Order[]
  inbox: Record<string, Inbox>
  /** fees taken, all told (money gone from the economy) */
  fees: number
  /** daily prices by symbol */
  history: Record<string, Candle[]>
  seq: number
}

export const emptyExchange = (): ExchangeState => ({ orders: [], inbox: {}, fees: 0, history: {}, seq: 0 })

/** What a player must hand over to put an order up: the goods, or the gold, plus the listing fee. */
export function escrowFor(side: "buy" | "sell", price: number, qty: number): { gold: number; fee: number } {
  const value = price * qty
  const fee = Math.max(1, Math.ceil(value * LISTING_FEE))
  return { gold: side === "buy" ? value + fee : fee, fee }
}

const dayOf = (at: number) => new Date(at + 9 * 3_600_000).toISOString().slice(0, 10)

function credit(inbox: Record<string, Inbox>, owner: string, gold: number, item?: Inbox["items"][number]) {
  const box = (inbox[owner] ??= { gold: 0, items: [] })
  box.gold += gold
  if (item && item.count > 0) {
    const same = box.items.find((x) => x.item === item.item && x.q === item.q && x.by === item.by)
    if (same) same.count += item.count
    else box.items.push({ ...item })
  }
}

function record(history: Record<string, Candle[]>, f: Fill) {
  const days = (history[f.symbol] ??= [])
  const day = dayOf(f.at)
  const last = days.at(-1)
  if (last?.day === day) {
    last.high = Math.max(last.high, f.price)
    last.low = Math.min(last.low, f.price)
    last.close = f.price
    last.volume += f.qty
  } else days.push({ day, open: f.price, high: f.price, low: f.price, close: f.price, volume: f.qty })
  if (days.length > 60) days.shift()
}

export interface Placed {
  state: ExchangeState
  order: Order | null
  fills: Fill[]
}

/**
 * Put up an order (its goods or gold already held by the exchange). It meets the best orders on the
 * other side first; what is left stays up (a limit order) or goes back to its owner (a market order).
 */
export function place(state: ExchangeState, o: { owner: string; name: string; side: "buy" | "sell"; symbol: string; price: number; qty: number; market?: boolean; by?: string }, now: number): Placed {
  const s: ExchangeState = structuredClone(state)
  const sym = parseSymbol(o.symbol)!
  const order: Order = {
    id: `o${++s.seq}`,
    owner: o.owner,
    name: o.name,
    side: o.side,
    symbol: o.symbol,
    price: o.price,
    left: o.qty,
    at: now,
    expires: now + MAX_DAYS * DAY,
    ...(o.by ? { by: o.by } : {}),
  }
  const fills: Fill[] = []
  const other = s.orders
    .filter((x) => x.symbol === o.symbol && x.side !== o.side && x.expires > now && (o.side === "buy" ? o.market || x.price <= o.price : o.market || x.price >= o.price))
    .sort((a, b) => (o.side === "buy" ? a.price - b.price : b.price - a.price) || a.at - b.at)
  for (const x of other) {
    if (order.left === 0) break
    const qty = Math.min(order.left, x.left)
    const price = x.price // the order already up sets the price
    const buyer = o.side === "buy" ? order : x,
      seller = o.side === "buy" ? x : order
    const fee = Math.ceil(price * qty * TRADE_FEE)
    s.fees += fee
    credit(s.inbox, seller.owner, price * qty - fee)
    credit(s.inbox, buyer.owner, 0, { item: sym.item, count: qty, ...(sym.q !== undefined ? { q: sym.q, by: seller.by ?? seller.name } : {}) })
    // a buyer who offered more than the price paid gets the difference back
    if (buyer.price > price) credit(s.inbox, buyer.owner, (buyer.price - price) * qty)
    order.left -= qty
    x.left -= qty
    const f: Fill = { symbol: o.symbol, price, qty, buyer: buyer.owner, seller: seller.owner, at: now }
    fills.push(f)
    record(s.history, f)
  }
  s.orders = s.orders.filter((x) => x.left > 0)
  if (order.left > 0) {
    if (o.market) giveBackOrder(s, order) // a market order does not stay up
    else s.orders.push(order)
  }
  return { state: s, order: order.left > 0 && !o.market ? order : null, fills }
}

/** Return what an order still holds to its owner's inbox. */
function giveBackOrder(s: ExchangeState, x: Order) {
  const sym = parseSymbol(x.symbol)!
  if (x.side === "buy") credit(s.inbox, x.owner, x.price * x.left)
  else credit(s.inbox, x.owner, 0, { item: sym.item, count: x.left, ...(sym.q !== undefined ? { q: sym.q, by: x.by ?? x.name } : {}) })
}

/** Take down an order: what it holds goes back to the owner's inbox (the listing fee does not). */
export function cancel(state: ExchangeState, owner: string, id: string): ExchangeState | null {
  const x = state.orders.find((o) => o.id === id && o.owner === owner)
  if (!x) return null
  const s: ExchangeState = structuredClone(state)
  giveBackOrder(s, x)
  s.orders = s.orders.filter((o) => o.id !== id)
  return s
}

/** Orders past their seven days go back to their owners. */
export function expire(state: ExchangeState, now: number): ExchangeState {
  if (!state.orders.some((o) => o.expires <= now)) return state
  const s: ExchangeState = structuredClone(state)
  for (const x of s.orders.filter((o) => o.expires <= now)) giveBackOrder(s, x)
  s.orders = s.orders.filter((o) => o.expires > now)
  return s
}

/** Empty a player's inbox (they collect it at the board). */
export function takeInbox(state: ExchangeState, owner: string): { state: ExchangeState; inbox: Inbox } {
  const box = state.inbox[owner] ?? { gold: 0, items: [] }
  const s: ExchangeState = structuredClone(state)
  delete s.inbox[owner]
  return { state: s, inbox: box }
}

/** The best prices on each side, and how many at each. */
export function book(state: ExchangeState, symbol: string, depth = 6): { bids: { price: number; qty: number }[]; asks: { price: number; qty: number }[] } {
  const side = (which: "buy" | "sell") => {
    const levels = new Map<number, number>()
    for (const o of state.orders) if (o.symbol === symbol && o.side === which) levels.set(o.price, (levels.get(o.price) ?? 0) + o.left)
    return [...levels]
      .map(([price, qty]) => ({ price, qty }))
      .sort((a, b) => (which === "buy" ? b.price - a.price : a.price - b.price))
      .slice(0, depth)
  }
  return { bids: side("buy"), asks: side("sell") }
}
