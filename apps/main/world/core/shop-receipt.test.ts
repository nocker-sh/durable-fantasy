import { expect, it } from "vitest"
import { receiveShop } from "#/world/core/receive-shop"
import type { ShopQuote } from "#/world/core/shop-receipt-types"
import { player } from "#/world/test/player"
import { bagWith } from "#/world/test/bag-with"

const quote: ShopQuote = { id: 1, type: "buy", shop: "fruit", item: "apple", count: 2, unitPrice: 5, keepers: ["オットー"] }
it("applies a quote once, preserving the current player and suppressing duplicate events on replay", () => {
  const before = player({ gold: 100 })
  const first = receiveShop({ player: before, previous: undefined, quote: quote, now: 1000, reserved: false })
  if (!first.result.ok) throw Error(first.result.reason)
  const later = { ...first.result.state, gold: 3 }
  expect(receiveShop({ player: later, previous: first.receipt, quote: quote, now: 2000, reserved: true })).toEqual({ result: { ok: true, state: later, events: [] } })
  expect(receiveShop({ player: later, previous: first.receipt, quote: { ...quote, unitPrice: 6 }, now: 2000, reserved: false }).result).toEqual({ ok: false, reason: "NOT_READY" })
  expect(receiveShop({ player: later, previous: first.receipt, quote: { ...quote, id: 0 }, now: 2000, reserved: false }).result).toEqual({ ok: false, reason: "NOT_READY" })
  expect(before.gold).toBe(100)
})
it("persists a refusal even after the player can afford or accept the purchase", () => {
  const refusal = receiveShop({ player: player({ gold: 0 }), previous: undefined, quote: quote, now: 1000, reserved: false })
  expect(refusal.result).toEqual({ ok: false, reason: "NO_GOLD" })
  expect(receiveShop({ player: player({ gold: 100 }), previous: refusal.receipt, quote: quote, now: 2000, reserved: false }).result).toEqual(refusal.result)
})
it("will not sell a replacement stack at the quote for the original stack", () => {
  const bag = bagWith(["herb", 3])
  const sale: ShopQuote = { id: 1, type: "sell", shop: "buyer", slot: 0, count: 2, unitPrice: 4, keepers: ["エックハルト"], stack: bag[0]! }
  const changed = player({ bag: bagWith(["jelly", 3]), gold: 10 })
  expect(receiveShop({ player: changed, previous: undefined, quote: sale, now: 1000, reserved: false }).result).toEqual({ ok: false, reason: "EMPTY_SLOT" })
  expect(changed.bag[0]?.count).toBe(3)
  expect(changed.gold).toBe(10)
})
it("does not debit items or commit unsafe gold arithmetic", () => {
  const bag = bagWith(["herb", 3])
  const sale: ShopQuote = { id: 1, type: "sell", shop: "buyer", slot: 0, count: 1, unitPrice: 4, keepers: [], stack: bag[0]! }
  const before = player({ bag, gold: Number.MAX_SAFE_INTEGER })
  expect(receiveShop({ player: before, previous: undefined, quote: sale, now: 1000, reserved: false }).result).toEqual({ ok: false, reason: "NOT_READY" })
  expect(before.bag).toEqual(bag)
})

it("replays a recorded outcome without revalidating a retired item, while rejecting it as a new purchase", () => {
  const legacy = { ...quote, item: "retired-item" } as unknown as ShopQuote
  const current = player()
  expect(receiveShop({ player: current, previous: { quote: legacy, outcome: { ok: true } }, quote: legacy, now: 1000, reserved: false })).toEqual({ result: { ok: true, state: current, events: [] } })
  expect(receiveShop({ player: current, previous: undefined, quote: legacy, now: 1000, reserved: false })).toEqual({ result: { ok: false, reason: "NOT_READY" } })
})
it("binds a sale receipt to the originally selected quantity and mark", () => {
  const selected = { item: "herb" as const, count: 3 }
  const sale: ShopQuote = { id: 1, type: "sell", shop: "buyer", slot: 0, count: 1, unitPrice: 4, keepers: [], stack: selected, expectedStack: selected }
  const result = receiveShop({ player: player({ bag: bagWith(["herb", 2]) }), previous: undefined, quote: sale, now: 1000, reserved: false })
  expect(result.result).toEqual({ ok: false, reason: "ITEM_CHANGED" })
  const current = player({ bag: bagWith(["herb", 3]) })
  expect(receiveShop({ player: current, previous: result.receipt, quote: sale, now: 2000, reserved: false }).result).toEqual(result.result)
  expect(receiveShop({ player: current, previous: result.receipt, quote: { ...sale, expectedStack: { ...selected, count: 2 } }, now: 2000, reserved: false }).result).toEqual({
    ok: false,
    reason: "NOT_READY",
  })
})
