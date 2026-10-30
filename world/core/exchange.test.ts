import { describe, expect, it } from "vitest"
import { book } from "#/world/core/book"
import { cancel } from "#/world/core/cancel"
import { expire } from "#/world/core/expire"
import { place } from "#/world/core/place"

import { emptyExchange } from "#/world/core/empty-exchange"
import { escrowFor } from "#/world/core/escrow-for"

import { parseSymbol } from "#/world/core/parse-symbol"
import { TRADE_FEE } from "#/world/core/exchange-rules"
import type { ExchangeState } from "#/world/core/exchange-types"

import { emptyClaims } from "#/world/core/empty-claims"
import { reserveInbox } from "#/world/core/reserve-inbox"

const sell = (s: ExchangeState, owner: string, price: number, qty: number, at = 0, symbol = "log") => place(s, { owner, name: owner, side: "sell", symbol, price, qty }, at).state
const buy = (s: ExchangeState, owner: string, price: number, qty: number, at = 0, market = false, symbol = "log") => place(s, { owner, name: owner, side: "buy", symbol, price, qty, market }, at)

/** Gold held by the exchange: resting buy orders, inboxes, fees. Items: resting sell orders and inboxes. */
const goldIn = (s: ExchangeState) => s.fees + Object.values(s.inbox).reduce((a, b) => a + b.gold, 0) + s.orders.filter((o) => o.side === "buy").reduce((a, o) => a + o.price * o.left, 0)
const itemsIn = (s: ExchangeState) =>
  Object.values(s.inbox).reduce((a, b) => a + b.items.reduce((x, i) => x + i.count, 0), 0) + s.orders.filter((o) => o.side === "sell").reduce((a, o) => a + o.left, 0)

describe("the exchange", () => {
  it("meets the cheapest seller first, then the earliest at the same price", () => {
    let s = sell(emptyExchange(), "A", 10, 5, 1)
    s = sell(s, "B", 9, 5, 2)
    s = sell(s, "C", 9, 5, 3)
    const r = buy(s, "X", 10, 7, 4)
    expect(r.fills.map((f) => [f.seller, f.price, f.qty])).toEqual([
      ["B", 9, 5],
      ["C", 9, 2],
    ])
    expect(book(r.state, "log").asks).toEqual([
      { price: 9, qty: 3 },
      { price: 10, qty: 5 },
    ])
  })

  it("an order met in part stays up for the rest; a market order takes what there is and returns the rest", () => {
    let s = sell(emptyExchange(), "A", 10, 3)
    const limit = buy(s, "X", 10, 5)
    expect(limit.order?.left).toBe(2)
    s = sell(emptyExchange(), "A", 10, 3)
    const market = buy(s, "Y", 999, 5, 0, true)
    expect(market.order).toBeNull()
    expect(market.fills[0].qty).toBe(3)
    // Y escrowed 999×5 and paid 10×3: the rest is waiting for them
    expect(market.state.inbox.Y.gold).toBe(999 * 5 - 30)
  })

  it("the seller gets the price less 3%, the buyer the goods and any overpayment back", () => {
    const s = sell(emptyExchange(), "A", 100, 1)
    const r = buy(s, "X", 120, 1)
    expect(r.state.inbox.A.gold).toBe(100 - Math.ceil(100 * TRADE_FEE))
    expect(r.state.inbox.X.gold).toBe(20)
    expect(r.state.inbox.X.items).toEqual([{ item: "log", count: 1 }])
    expect(r.state.fees).toBe(3)
  })

  it("keeps every coin and every item: nothing made or lost by trading, cancelling or expiring", () => {
    let s = emptyExchange()
    let goldPut = 0,
      itemsPut = 0
    const put = (side: "buy" | "sell", owner: string, price: number, qty: number, at: number) => {
      if (side === "buy") goldPut += price * qty
      else itemsPut += qty
      s = place(s, { owner, name: owner, side, symbol: "log", price, qty }, at).state
    }
    put("sell", "A", 10, 4, 1)
    put("sell", "B", 12, 6, 2)
    put("buy", "X", 11, 7, 3)
    put("buy", "Y", 13, 5, 4)
    put("sell", "C", 9, 10, 5)
    s = cancel(s, "A", s.orders.find((o) => o.owner === "A")?.id ?? "") ?? s
    s = expire(s, 8 * 86_400_000)
    expect(goldIn(s)).toBe(goldPut)
    expect(itemsIn(s)).toBe(itemsPut)
    expect(s.orders).toHaveLength(0)
    const taken = reserveInbox(s, emptyClaims(), "X")
    expect(taken.ex.inbox.X).toBeUndefined()
    expect(taken.claim.inbox.items.reduce((a, i) => a + i.count, 0)).toBeGreaterThan(0)
  })

  it("made things trade by quality, and the maker comes with them", () => {
    expect(parseSymbol("potion")).toBeNull() // a made thing needs its quality
    expect(parseSymbol("potion@2")).toEqual({ item: "potion", q: 2 })
    const s = place(emptyExchange(), { owner: "A", name: "A", side: "sell", symbol: "potion@2", price: 50, qty: 2, by: "イルムガルト" }, 0).state
    const r = buy(s, "X", 50, 1, 1, false, "potion@2")
    expect(r.state.inbox.X.items[0]).toEqual({ item: "potion", count: 1, q: 2, by: "イルムガルト" })
  })

  it("charges 1% to put an order up, at least 1", () => {
    expect(escrowFor("sell", 10, 3)).toEqual({ gold: 1, fee: 1 })
    expect(escrowFor("buy", 200, 5)).toEqual({ gold: 1010, fee: 10 })
  })

  it("records the day's prices", () => {
    let s = sell(emptyExchange(), "A", 10, 5)
    s = buy(s, "X", 10, 2, 1).state
    s = sell(s, "B", 8, 1, 2)
    s = buy(s, "Y", 8, 1, 3).state
    expect(s.history.log.at(-1)).toMatchObject({ open: 10, high: 10, low: 8, close: 8, volume: 3 })
  })
})

it("limits market purchases to the escrowed budget across price levels", () => {
  let state = sell(emptyExchange(), "first", 9, 1, 0)
  state = sell(state, "second", 11, 1, 1)
  const within = buy(state, "buyer", 10, 2, 2, true)
  expect(within.fills.map((fill) => [fill.price, fill.qty])).toEqual([
    [9, 1],
    [11, 1],
  ])
  expect(within.order).toBeNull()
  expect(within.state.inbox.buyer.items).toEqual([{ item: "log", count: 2 }])
  expect(goldIn(within.state)).toBe(20)

  const costly = buy(sell(emptyExchange(), "seller", 11, 2), "buyer", 10, 2, 1, true)
  expect(costly.fills.map((fill) => fill.qty)).toEqual([1])
  expect(costly.state.inbox.buyer.gold).toBe(9)
  expect(costly.order).toBeNull()
  expect(goldIn(costly.state)).toBe(20)
  expect(itemsIn(costly.state)).toBe(2)

  const unaffordable = buy(sell(emptyExchange(), "seller", 21, 1), "buyer", 10, 2, 1, true)
  expect(unaffordable.fills).toEqual([])
  expect(unaffordable.state.inbox.buyer.gold).toBe(20)
  expect(goldIn(unaffordable.state)).toBe(20)
})

it("conserves every coin and item across mixed market and limit orders at changing prices", () => {
  let state = emptyExchange()
  let gold = 0,
    items = 0
  for (let i = 0; i < 80; i++) {
    const side = i % 2 ? "sell" : "buy"
    const price = ((i * 17) % 23) + 1
    const qty = (i % 5) + 1
    if (side === "buy") gold += price * qty
    else items += qty
    state = place(state, { owner: `owner-${i}`, name: "取引人", side, symbol: "log", price, qty, market: i % 3 === 0 }, i).state
    expect(goldIn(state)).toBe(gold)
    expect(itemsIn(state)).toBe(items)
  }
  for (const order of state.orders.filter((_, i) => i % 3 === 0)) state = cancel(state, order.owner, order.id)!
  state = expire(state, 8 * 86_400_000)
  expect(goldIn(state)).toBe(gold)
  expect(itemsIn(state)).toBe(items)
  expect(state.orders).toHaveLength(0)
})

it("retains queue order on both sides when price and timestamp are identical", () => {
  const firstAsk = sell(emptyExchange(), "Z", 10, 1, 5)
  const asks = sell(firstAsk, "A", 10, 1, 5)
  const bought = buy(asks, "buyer", 10, 1, 6)
  expect(bought.fills.map((fill) => fill.seller)).toEqual(["Z"])
  expect(bought.state.orders.map((order) => order.owner)).toEqual(["A"])
  const firstBid = buy(emptyExchange(), "Z", 10, 1, 5).state
  const bids = buy(firstBid, "A", 10, 1, 5).state
  const sold = place(bids, { owner: "seller", name: "ハンス", side: "sell", symbol: "log", price: 10, qty: 1 }, 6)
  expect(sold.fills.map((fill) => fill.buyer)).toEqual(["Z"])
  expect(sold.state.orders.map((order) => order.owner)).toEqual(["A"])
})
