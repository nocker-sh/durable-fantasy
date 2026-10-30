import type { MarketState } from "#/world/core/market-types"
import { describe, expect, it } from "vitest"
import { makerAt } from "#/world/core/maker-at"
import { BATCHES } from "#/world/core/market-batches"
import { wantsMore } from "#/world/core/wants-more"
import { buyingPrice } from "#/world/core/buying-price"
import { emptyMarket } from "#/world/core/empty-market"
import { giveBack } from "#/world/core/give-back"
import { nextBatch } from "#/world/core/next-batch"
import { priceNow } from "#/world/core/price-now"
import { restock } from "#/world/core/restock"
import { splitBatch } from "#/world/core/split-batch"
import { take } from "#/world/core/take"
import { moveStock } from "#/world/core/move-stock"

import { seedStock } from "#/world/core/seed-stock"

import { stockOf } from "#/world/core/stock-of"
import { stockPrice } from "#/world/core/stock-price"

import { target } from "#/world/core/target"
import { priceOf } from "#/world/core/price-of"
import type { ItemId } from "#/world/core/items/catalog"
import type { ShopId } from "#/world/core/shop-types"

const maker = (shop: string, item: ItemId) => makerAt(shop as ShopId, item)
/** ms for a time of day on 2026-10-21, Japan time */
const at = (h: number, m = 0) => Date.UTC(2026, 9, 21, h - 9, m)
const total = (q: number[] | undefined) => (q ?? []).reduce((a, b) => a + b, 0)

describe("the shared shelf", () => {
  it("bread comes out at its hours in its numbers, and residents buy their share", () => {
    const m = restock(emptyMarket(at(2, 0)), at(3, 10), maker)
    expect(total(m.shelf.bakery?.["rye-bread"])).toBe(12)
    const later = restock(m, at(3, 45), maker)
    expect(total(later.shelf.bakery?.["rye-bread"])).toBe(12 - BATCHES.bakery["rye-bread"]!.eaten!.count)
  })

  it("comes out the same for everyone, however the time is cut up", () => {
    const once = restock(emptyMarket(at(2)), at(10), maker)
    let step = emptyMarket(at(2))
    for (let h = 3; h <= 10; h++) step = restock(step, at(h), maker)
    expect(step.shelf).toEqual(once.shelf)
  })

  it("the batch falls into qualities by the maker's hand", () => {
    const split = splitBatch({ item: "rye-bread", by: "マルタ", count: 200, seed: 1 })
    expect(total(split)).toBe(200)
    expect(split[1]).toBeGreaterThan(split[0]) // Marta's are steady: mostly 良
  })

  it("two buyers for the last loaf: one gets it, the other is told it is sold out, and nothing goes below zero", () => {
    let m = restock(emptyMarket(at(2)), at(3, 5), maker)
    const row = m.shelf.bakery!["rye-bread"]!
    const q = row.findIndex((n) => n > 0) as 0 | 1 | 2 | 3
    const price = priceOf("rye-bread", q, "マルタ")
    // empty the shelf of that quality but one
    const first = take({ state: m, shop: "bakery", item: "rye-bread", q: q, count: row[q] - 1, price: price, expected: price })
    expect(first.ok).toBe(true)
    if (!first.ok) return
    m = first.state
    const a = take({ state: m, shop: "bakery", item: "rye-bread", q: q, count: 1, price: price, expected: price })
    expect(a.ok).toBe(true)
    if (!a.ok) return
    const b = take({ state: a.state, shop: "bakery", item: "rye-bread", q: q, count: 1, price: price, expected: price })
    expect(b).toEqual({ ok: false, reason: "SOLD_OUT" })
    expect(a.state.shelf.bakery!["rye-bread"]![q]).toBe(0)
    // a buyer who could not pay puts it back
    expect(giveBack({ state: a.state, shop: "bakery", item: "rye-bread", q: q, count: 1 }).shelf.bakery!["rye-bread"]![q]).toBe(1)
  })

  it("refuses when the price moved since the buyer looked", () => {
    const m = restock(emptyMarket(at(2)), at(3, 5), maker)
    expect(take({ state: m, shop: "bakery", item: "rye-bread", q: 1, count: 1, price: 9, expected: 5 })).toEqual({ ok: false, reason: "PRICE_CHANGED" })
  })

  it("is cheaper near closing time; a kept thing can run out only if bought faster than it comes back", () => {
    const full = priceNow({ item: "rye-bread", q: 1, by: "マルタ", toClose: 120, isBatched: true })
    expect(priceNow({ item: "rye-bread", q: 1, by: "マルタ", toClose: 50, isBatched: true })).toBeLessThan(full)
    expect(priceNow({ item: "rye-bread", q: 1, by: "マルタ", toClose: 20, isBatched: true })).toBeLessThan(priceNow({ item: "rye-bread", q: 1, by: "マルタ", toClose: 50, isBatched: true }))
    expect(priceNow({ item: "herb", q: 1, by: undefined, toClose: 20, isBatched: false })).toBe(priceOf("herb"))
    expect(take({ state: emptyMarket(0), shop: "apothecary", item: "herb", q: 1, count: target("herb"), price: 6, expected: 6 }).ok).toBe(true)
    expect(take({ state: emptyMarket(0), shop: "apothecary", item: "herb", q: 1, count: target("herb") + 1, price: 6, expected: 6 })).toEqual({ ok: false, reason: "SOLD_OUT" })
  })

  it("knows when the next batch is", () => {
    expect(nextBatch("bakery", "rye-bread", at(4))).toBe(at(6))
    expect(nextBatch("bakery", "rye-bread", at(10))).toBe(at(3) + 86_400_000)
  })
})

describe("prices that follow the stock", () => {
  const fresh = (): MarketState => ({ ...emptyMarket(0), stock: seedStock({ apothecary: { stock: ["herb", "blue-herb"] } }) })

  it("starts at the list price, goes up as players buy and down as they sell, within three tenths", () => {
    let m = fresh()
    const list = stockPrice({ state: m, shop: "apothecary", item: "herb", q: 1, by: undefined })
    expect(list).toBe(priceOf("herb"))
    for (let k = 0; k < 6; k++) {
      const r = take({ state: m, shop: "apothecary", item: "herb", q: 1, count: 5, price: stockPrice({ state: m, shop: "apothecary", item: "herb", q: 1, by: undefined }), expected: undefined })
      if (r.ok) m = r.state
    }
    expect(stockPrice({ state: m, shop: "apothecary", item: "herb", q: 1, by: undefined })).toBeGreaterThan(list)
    m = moveStock({ state: m, shop: "apothecary", item: "herb", delta: 500 })
    expect(stockPrice({ state: m, shop: "apothecary", item: "herb", q: 1, by: undefined })).toBe(Math.round(priceOf("herb") * 0.7))
    m = moveStock({ state: m, shop: "apothecary", item: "herb", delta: -10_000 })
    expect(stockPrice({ state: m, shop: "apothecary", item: "herb", q: 1, by: undefined })).toBe(Math.round(priceOf("herb") * 1.3))
  })

  it("the shop pays under half its own price, and less when it is full", () => {
    const m = fresh()
    expect(buyingPrice({ state: m, shop: "apothecary", item: "blue-herb" })).toBeLessThan(stockPrice({ state: m, shop: "apothecary", item: "blue-herb", q: 1, by: undefined }) / 2)
    expect(buyingPrice({ state: moveStock({ state: m, shop: "apothecary", item: "blue-herb", delta: 50 }), shop: "apothecary", item: "blue-herb" })).toBeLessThan(
      buyingPrice({ state: m, shop: "apothecary", item: "blue-herb" }),
    )
  })

  it("producers bring the stock back over the hours, and residents keep buying a little", () => {
    const emptied = moveStock({ state: fresh(), shop: "apothecary", item: "herb", delta: -10_000 })
    const later = restock(emptied, at(2) + 12 * 3_600_000, maker)
    expect(stockOf(later, "apothecary", "herb")).toBeGreaterThan(10)
    expect(stockOf(later, "apothecary", "herb")).toBeLessThanOrEqual(target("herb"))
  })

  it("accepts a price that moved a little since the buyer looked, refuses one that moved more than 5%", () => {
    const m = fresh()
    expect(take({ state: m, shop: "apothecary", item: "blue-herb", q: 1, count: 1, price: 26, expected: 25 }).ok).toBe(true)
    expect(take({ state: m, shop: "apothecary", item: "blue-herb", q: 1, count: 1, price: 30, expected: 25 })).toEqual({ ok: false, reason: "PRICE_CHANGED" })
  })

  it("a full shop stops buying, so selling to the shops cannot print money without end", () => {
    const m = fresh()
    expect(wantsMore({ state: m, shop: "apothecary", item: "herb", count: 10 })).toBe(true)
    expect(wantsMore({ state: moveStock({ state: m, shop: "apothecary", item: "herb", delta: target("herb") * 2 }), shop: "apothecary", item: "herb", count: 1 })).toBe(false)
  })
})
