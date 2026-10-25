import { describe, expect, it } from "vitest";
import { makerAt } from "./apply.ts";
import { BATCHES, wantsMore, buyingPrice, emptyMarket, giveBack, moveStock, nextBatch, priceNow, restock, seedStock, splitBatch, stockOf, stockPrice, take, target } from "./market.ts";
import { priceOf } from "./makers.ts";
import type { ItemId } from "./items.ts";
import type { ShopId } from "./shops.ts";

const maker = (shop: string, item: ItemId) => makerAt(shop as ShopId, item);
/** ms for a time of day on 2026-10-21, Japan time */
const at = (h: number, m = 0) => Date.UTC(2026, 9, 21, h - 9, m);
const total = (q: number[] | undefined) => (q ?? []).reduce((a, b) => a + b, 0);

describe("the shared shelf", () => {
  it("bread comes out at its hours in its numbers, and residents buy their share", () => {
    const m = restock(emptyMarket(at(2, 0)), at(3, 10), maker);
    expect(total(m.shelf.bakery?.["rye-bread"])).toBe(12);
    const later = restock(m, at(3, 45), maker);
    expect(total(later.shelf.bakery?.["rye-bread"])).toBe(12 - BATCHES.bakery["rye-bread"]!.eaten!.count);
  });

  it("comes out the same for everyone, however the time is cut up", () => {
    const once = restock(emptyMarket(at(2)), at(10), maker);
    let step = emptyMarket(at(2));
    for (let h = 3; h <= 10; h++) step = restock(step, at(h), maker);
    expect(step.shelf).toEqual(once.shelf);
  });

  it("the batch falls into qualities by the maker's hand", () => {
    const split = splitBatch("rye-bread", "マルタ", 200, 1);
    expect(total(split)).toBe(200);
    expect(split[1]).toBeGreaterThan(split[0]); // Marta's are steady: mostly 良
  });

  it("two buyers for the last loaf: one gets it, the other is told it is sold out, and nothing goes below zero", () => {
    let m = restock(emptyMarket(at(2)), at(3, 5), maker);
    const row = m.shelf.bakery!["rye-bread"]!;
    const q = row.findIndex((n) => n > 0) as 0 | 1 | 2 | 3;
    const price = priceOf("rye-bread", q, "マルタ");
    // empty the shelf of that quality but one
    const first = take(m, "bakery", "rye-bread", q, row[q] - 1, price, price);
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    m = first.state;
    const a = take(m, "bakery", "rye-bread", q, 1, price, price);
    expect(a.ok).toBe(true);
    if (!a.ok) return;
    const b = take(a.state, "bakery", "rye-bread", q, 1, price, price);
    expect(b).toEqual({ ok: false, reason: "SOLD_OUT" });
    expect(a.state.shelf.bakery!["rye-bread"]![q]).toBe(0);
    // a buyer who could not pay puts it back
    expect(giveBack(a.state, "bakery", "rye-bread", q, 1).shelf.bakery!["rye-bread"]![q]).toBe(1);
  });

  it("refuses when the price moved since the buyer looked", () => {
    const m = restock(emptyMarket(at(2)), at(3, 5), maker);
    expect(take(m, "bakery", "rye-bread", 1, 1, 9, 5)).toEqual({ ok: false, reason: "PRICE_CHANGED" });
  });

  it("is cheaper near closing time; a kept thing can run out only if bought faster than it comes back", () => {
    const full = priceNow("rye-bread", 1, "マルタ", 120, true);
    expect(priceNow("rye-bread", 1, "マルタ", 50, true)).toBeLessThan(full);
    expect(priceNow("rye-bread", 1, "マルタ", 20, true)).toBeLessThan(priceNow("rye-bread", 1, "マルタ", 50, true));
    expect(priceNow("herb", 1, undefined, 20, false)).toBe(priceOf("herb"));
    expect(take(emptyMarket(0), "apothecary", "herb", 1, target("herb"), 6, 6).ok).toBe(true);
    expect(take(emptyMarket(0), "apothecary", "herb", 1, target("herb") + 1, 6, 6)).toEqual({ ok: false, reason: "SOLD_OUT" });
  });

  it("knows when the next batch is", () => {
    expect(nextBatch("bakery", "rye-bread", at(4))).toBe(at(6));
    expect(nextBatch("bakery", "rye-bread", at(10))).toBe(at(3) + 86_400_000);
  });
});

describe("prices that follow the stock", () => {
  const fresh = (): import("./market.ts").MarketState => ({ ...emptyMarket(0), stock: seedStock({ apothecary: { stock: ["herb", "blue-herb"] } }) });

  it("starts at the list price, goes up as players buy and down as they sell, within three tenths", () => {
    let m = fresh();
    const list = stockPrice(m, "apothecary", "herb", 1, undefined);
    expect(list).toBe(priceOf("herb"));
    for (let k = 0; k < 6; k++) {
      const r = take(m, "apothecary", "herb", 1, 5, stockPrice(m, "apothecary", "herb", 1, undefined), undefined);
      if (r.ok) m = r.state;
    }
    expect(stockPrice(m, "apothecary", "herb", 1, undefined)).toBeGreaterThan(list);
    m = moveStock(m, "apothecary", "herb", 500);
    expect(stockPrice(m, "apothecary", "herb", 1, undefined)).toBe(Math.round(priceOf("herb") * 0.7));
    m = moveStock(m, "apothecary", "herb", -10_000);
    expect(stockPrice(m, "apothecary", "herb", 1, undefined)).toBe(Math.round(priceOf("herb") * 1.3));
  });

  it("the shop pays under half its own price, and less when it is full", () => {
    const m = fresh();
    expect(buyingPrice(m, "apothecary", "blue-herb")).toBeLessThan(stockPrice(m, "apothecary", "blue-herb", 1, undefined) / 2);
    expect(buyingPrice(moveStock(m, "apothecary", "blue-herb", 50), "apothecary", "blue-herb")).toBeLessThan(buyingPrice(m, "apothecary", "blue-herb"));
  });

  it("producers bring the stock back over the hours, and residents keep buying a little", () => {
    const emptied = moveStock(fresh(), "apothecary", "herb", -10_000);
    const later = restock(emptied, at(2) + 12 * 3_600_000, maker);
    expect(stockOf(later, "apothecary", "herb")).toBeGreaterThan(10);
    expect(stockOf(later, "apothecary", "herb")).toBeLessThanOrEqual(target("herb"));
  });

  it("accepts a price that moved a little since the buyer looked, refuses one that moved more than 5%", () => {
    const m = fresh();
    expect(take(m, "apothecary", "blue-herb", 1, 1, 26, 25).ok).toBe(true);
    expect(take(m, "apothecary", "blue-herb", 1, 1, 30, 25)).toEqual({ ok: false, reason: "PRICE_CHANGED" });
  });

  it("a full shop stops buying, so selling to the shops cannot print money without end", () => {
    const m = fresh();
    expect(wantsMore(m, "apothecary", "herb", 10)).toBe(true);
    expect(wantsMore(moveStock(m, "apothecary", "herb", target("herb") * 2), "apothecary", "herb", 1)).toBe(false);
  });
});
