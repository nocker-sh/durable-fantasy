import { expect, it } from "vitest"
import { parseSymbol } from "#/world/core/parse-symbol"
import { orderFailure } from "#/world/core/order-failure"
import { cancel } from "#/world/core/cancel"
import { emptyExchange } from "#/world/core/empty-exchange"
import type { ExchangeState } from "#/world/core/exchange-types"
it.each(["\n", "\r", "\r\n", "\u2028", "\u2029"])("rejects a trailing line separator in a fresh quality symbol: %j", (suffix) => {
  expect(parseSymbol(`potion@1${suffix}`)).toBeNull()
  expect(orderFailure({ side: "buy", symbol: `potion@1${suffix}`, price: 1, qty: 1 })).toBe("NOT_SELLABLE")
})
it("still returns an existing marked order whose old quality spelling ends in a newline", () => {
  const state: ExchangeState = {
    ...emptyExchange(),
    orders: [{ id: "o1", owner: "owner", name: "ハンス", side: "sell", symbol: "potion@1\n", price: 10, left: 2, at: 0, expires: 1, by: "イルムガルト" }],
  }
  const before = structuredClone(state)
  expect(cancel(state, "owner", "o1")?.inbox.owner.items).toEqual([{ item: "potion", count: 2, q: 1, by: "イルムガルト" }])
  expect(state).toEqual(before)
})
