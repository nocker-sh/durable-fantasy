import { expect, it } from "vitest"
import { creditExchangeInbox } from "#/world/core/credit-exchange-inbox"
import { emptyClaims } from "#/world/core/empty-claims"
import { emptyExchange } from "#/world/core/empty-exchange"
import { finishInbox } from "#/world/core/finish-inbox"
import { place } from "#/world/core/place"
import { reserveInbox } from "#/world/core/reserve-inbox"
import type { ExchangeState, Inbox } from "#/world/core/exchange-types"

const offer = (owner: string, side: "buy" | "sell", qty: number) => ({ owner, name: owner, side, symbol: "log", price: 1, qty })

it("opens no box for a credit of nothing", () => {
  const inbox: Record<string, Inbox> = {}
  creditExchangeInbox({ inbox, owner: "owner", gold: 0 })
  creditExchangeInbox({ inbox, owner: "owner", gold: 0, item: { item: "log", count: 0 } })
  expect(inbox).toEqual({})
})

it("leaves no empty box for a seller whose last 1G sale goes wholly to the fee", () => {
  // the fee on 34G sold is 1G and on 33G nothing (fill-exchange-order.ts), so the 34th sale pays the seller nothing
  const listed = place(emptyExchange(), offer("seller", "sell", 34), 0).state
  const bought = place(listed, offer("first", "buy", 33), 1).state
  expect(bought.inbox.seller).toEqual({ gold: 33, items: [] })
  const claimed = reserveInbox(bought, emptyClaims(), "seller").ex
  const last = place(claimed, offer("second", "buy", 1), 2).state
  expect(last.inbox.seller).toBeUndefined()
  expect(last.inbox.second).toEqual({ gold: 0, items: [{ item: "log", count: 1 }] })
  expect(last.fees).toBe(claimed.fees + 1)
})

it("keeps no box for a refused claim that held nothing, and restores one that held something exactly", () => {
  const empty = reserveInbox(emptyExchange(), emptyClaims(), "owner")
  expect(finishInbox({ ex: empty.ex, delivery: empty.delivery, owner: "owner", id: empty.claim.id, accepted: false }).ex.inbox).toEqual({})
  const ex: ExchangeState = { ...emptyExchange(), inbox: { owner: { gold: 4, items: [{ item: "herb", count: 2 }] } } }
  const held = reserveInbox(ex, emptyClaims(), "owner")
  expect(finishInbox({ ex: held.ex, delivery: held.delivery, owner: "owner", id: held.claim.id, accepted: false }).ex.inbox).toEqual(ex.inbox)
})
