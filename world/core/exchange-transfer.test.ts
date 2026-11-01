import { expect, it } from "vitest"
import { emptyClaims } from "#/world/core/empty-claims"
import { reserveInbox } from "#/world/core/reserve-inbox"
import { apply } from "#/world/core/apply"
import { emptyBag } from "#/world/core/empty-bag"
import { cancel } from "#/world/core/cancel"
import { expire } from "#/world/core/expire"
import { place } from "#/world/core/place"
import { emptyExchange } from "#/world/core/empty-exchange"

import { parseSymbol } from "#/world/core/parse-symbol"

import { symbolKey } from "#/world/core/symbol-key"
import { ITEMS } from "#/world/core/items/catalog"
import { ITEM_IDS } from "#/world/core/items/item-ids"
import { sellable } from "#/world/core/items/sellable"
import type { Quality } from "#/world/core/items/kinds"
import { player } from "#/world/test/player"
import { fullDurability } from "#/world/core/full-durability"

it.each(["constructor", "__proto__", "toString", "unknown", "potion", "potion@", "potion@01", "potion@1.0", "potion@1e0", "potion@ 1", "potion@1@extra", "log@1", "potion@4"])(
  "rejects a non-canonical exchange symbol: %s",
  (symbol) => expect(parseSymbol(symbol)).toBeNull(),
)

it("accepts exactly the tradable item and quality combinations", () => {
  for (const item of ITEM_IDS) {
    const allowed = sellable(item)
    expect(parseSymbol(item)).toEqual(allowed && !ITEMS[item].made ? { item } : null)
    for (const q of [0, 1, 2, 3] as const) {
      const symbol = { item, q }
      expect(parseSymbol(symbolKey(symbol))).toEqual(allowed && ITEMS[item].made ? symbol : null)
    }
  }
})

it("rejects invalid placement before changing the exchange", () => {
  const state = emptyExchange()
  const before = structuredClone(state)
  expect(() => place(state, { owner: "buyer", name: "買い手", side: "buy", symbol: "constructor", price: 10, qty: 1 }, 0)).toThrow("Invalid exchange symbol")
  expect(state).toEqual(before)
})

it.each([undefined, "イルムガルト"])("preserves the maker through matching and collection: %s", (by) => {
  const selling = place(emptyExchange(), { owner: "seller", name: "売り手", side: "sell", symbol: "potion@1", price: 10, qty: 1, by }, 0).state
  const matched = place(selling, { owner: "buyer", name: "買い手", side: "buy", symbol: "potion@1", price: 10, qty: 1 }, 1).state
  const inbox = reserveInbox(matched, emptyClaims(), "buyer").claim.inbox
  const stack = { item: "potion", count: 1, q: 1, ...(by !== undefined ? { by } : {}) }
  expect(inbox.items).toEqual([stack])
  const received = apply(player({ bag: emptyBag() }), { type: "receive", ...inbox })
  if (!received.ok) throw Error(received.reason)
  expect(received.state.bag[0]).toEqual(stack)
})

it.each([
  ["potion", undefined],
  ["potion@01", 1],
  ["potion@1@old", 1],
] as const)("refunds legacy held goods without inventing marks: %s", (symbol, q: Quality | undefined) => {
  const state = place(emptyExchange(), { owner: "seller", name: "売り手", side: "sell", symbol: "potion@1", price: 10, qty: 2 }, 0).state
  state.orders[0].symbol = symbol
  const expected = { item: "potion", count: 2, ...(q !== undefined ? { q } : {}) }
  for (const refunded of [cancel(state, "seller", state.orders[0].id)!, expire(state, state.orders[0].expires)]) {
    const inbox = reserveInbox(refunded, emptyClaims(), "seller").claim.inbox
    expect(inbox.items).toEqual([expected])
    const received = apply(player({ bag: emptyBag() }), { type: "receive", ...inbox })
    if (!received.ok) throw Error(received.reason)
    expect(received.state.bag[0]).toEqual(expected)
  }
})

it("refuses a partly fitting collection without changing items or crediting gold", () => {
  const before = player({ gold: 5, bag: emptyBag().map(() => ({ item: "log" as const, count: 98 })) })
  const snapshot = structuredClone(before)
  expect(
    apply(before, {
      type: "receive",
      gold: 20,
      items: [
        { item: "log", count: 1 },
        { item: "potion", count: 1, q: 1 },
      ],
    }),
  ).toEqual({ ok: false, reason: "BAG_FULL" })
  expect(before).toEqual(snapshot)
})

it("lists a tool only unworn and hands it over at its full durability", () => {
  const full = fullDurability("sickle", 1)!
  const worn = apply(player({ gold: 100, bag: [{ item: "sickle", count: 1, q: 1, by: "ギュンター", dur: full - 1 }, ...emptyBag().slice(1)] }), { type: "escrow-sell", slot: 0, qty: 1, fee: 1 })
  expect(worn).toEqual({ ok: false, reason: "WORN_TOOL" })
  const selling = place(emptyExchange(), { owner: "seller", name: "売り手", side: "sell", symbol: "sickle@1", price: 30, qty: 1, by: "ギュンター" }, 0).state
  const matched = place(selling, { owner: "buyer", name: "買い手", side: "buy", symbol: "sickle@1", price: 30, qty: 1 }, 1).state
  const inbox = reserveInbox(matched, emptyClaims(), "buyer").claim.inbox
  const received = apply(player({ bag: emptyBag() }), { type: "receive", ...inbox })
  if (!received.ok) throw Error(received.reason)
  expect(received.state.bag[0]).toEqual({ item: "sickle", count: 1, q: 1, by: "ギュンター", dur: full })
})
