import { expect, it } from "vitest"
import { emptyExchange } from "#/world/core/empty-exchange"
import { place } from "#/world/core/place"
import { holdOrder } from "#/world/core/hold-order"
import { emptyBag } from "#/world/core/empty-bag"
import { player } from "#/world/test/player"

it("does not mutate an escrow input and refuses changed or older receipts", () => {
  const before = player({ gold: 100, bag: emptyBag() })
  const snapshot = structuredClone(before)
  const intent = { side: "buy" as const, symbol: "log", price: 10, qty: 2 }
  const held = holdOrder({ player: before, previous: null, id: 1, intent: intent, now: 1 })
  if (!held.ok) throw Error(held.reason)
  expect(before).toEqual(snapshot)
  expect(held.state.gold).toBe(79)
  expect(holdOrder({ player: held.state, previous: held.receipt, id: 1, intent: intent, now: 2 })).toMatchObject({ ok: true, state: held.state, events: [] })
  expect(holdOrder({ player: held.state, previous: held.receipt, id: 1, intent: { ...intent, qty: 3 }, now: 2 })).toEqual({ ok: false, reason: "NOT_READY" })
  expect(holdOrder({ player: held.state, previous: { ...held.receipt, id: 2 }, id: 1, intent: intent, now: 2 })).toEqual({ ok: false, reason: "NOT_READY" })
})

it.each([
  { side: "buy" as const, symbol: "constructor", price: 10, qty: 2 },
  { side: "buy" as const, symbol: "log", price: -1, qty: 2 },
  { side: "buy" as const, symbol: "log", price: 1.5, qty: 2 },
  { side: "buy" as const, symbol: "log", price: 2_000_000, qty: 2 },
  { side: "buy" as const, symbol: "log", price: 10, qty: 0 },
  { side: "buy" as const, symbol: "log", price: 10, qty: 100 },
])("refuses invalid escrow without changing inventory or money: %j", (intent) => {
  const before = player({ gold: 100, bag: emptyBag() })
  const snapshot = structuredClone(before)
  expect(holdOrder({ player: before, previous: null, id: 1, intent: intent, now: 1 }).ok).toBe(false)
  expect(before).toEqual(snapshot)
  const exchange = emptyExchange()
  expect(() => place(exchange, { owner: "owner", name: "取引人", ...intent }, 1)).toThrow(/Invalid exchange/)
  expect(exchange).toEqual(emptyExchange())
})
