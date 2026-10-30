import { describe, expect, it } from "vitest"
import { apply } from "#/world/core/apply"
import { BAG_SIZE } from "#/world/core/bag-rules"
import { addItem } from "#/world/core/add-item"
import { countItem } from "#/world/core/count-item"
import { emptyBag } from "#/world/core/empty-bag"
import { ITEMS } from "#/world/core/items/catalog"
import { sellPrice } from "#/world/core/items/sell-price"
import { SHOPS } from "#/world/core/shops"
import { shopOfKeeper } from "#/world/core/shop-of-keeper"
import { bagWith } from "#/world/test/bag-with"
import { player } from "#/world/test/player"

describe("shop", () => {
  it("maps every merchant to a shop", () => {
    expect(shopOfKeeper("オットー")).toBe("fruit")
    expect(shopOfKeeper("グレーテ")).toBe("vegetables")
    expect(shopOfKeeper("ヤコブ")).toBe("fish")
    expect(shopOfKeeper("マルタ")).toBe("bakery")
    expect(shopOfKeeper("ハンス")).toBe("bakery")
    expect(shopOfKeeper("ギュンター")).toBe("smithy")
    expect(shopOfKeeper("ゲルダ")).toBe("inn")
    expect(shopOfKeeper("イルムガルト")).toBe("apothecary")
    expect(shopOfKeeper("ペーター")).toBeNull()
  })

  it("buying takes gold and puts the goods in the bag", () => {
    const result = apply(player({ gold: 50 }), { type: "buy", shop: "fruit", item: "apple", count: 4 })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.state.gold).toBe(50 - ITEMS.apple.price * 4)
    expect(countItem(result.state.bag, "apple")).toBe(4)
    expect(result.events).toEqual([{ type: "bought", item: "apple", count: 4, cost: 12 }])
  })

  it("refuses goods the shop does not stock", () => {
    expect(apply(player(), { type: "buy", shop: "fruit", item: "mace", count: 1 })).toEqual({ ok: false, reason: "NOT_SOLD_HERE" })
  })

  it("refuses when gold is short, without changing anything", () => {
    const before = player({ gold: 100 })
    expect(apply(before, { type: "buy", shop: "smithy", item: "mace", count: 1 })).toEqual({ ok: false, reason: "NO_GOLD" })
    expect(before.gold).toBe(100)
  })

  it("refuses when the bag is full", () => {
    const full = player({ gold: 10_000, bag: addItem({ bag: emptyBag(), item: "dagger", count: BAG_SIZE })! })
    expect(apply(full, { type: "buy", shop: "fruit", item: "apple", count: 1 })).toEqual({ ok: false, reason: "BAG_FULL" })
  })

  it("refuses what would be too heavy to carry", () => {
    // 2000 + STR 1 × 30 = 2030; 21 spears weigh 2100
    const loaded = player({ gold: 100_000, bag: bagWith(["spear", 20]) })
    expect(apply(loaded, { type: "buy", shop: "smithy", item: "spear", count: 1 })).toEqual({ ok: false, reason: "TOO_HEAVY" })
  })

  it("selling pays half the price", () => {
    const start = player({ gold: 0, bag: bagWith(["short-sword", 1]) })
    const result = apply(start, { type: "sell", shop: "smithy", slot: 0, count: 1 })
    expect(result.ok && result.state.gold).toBe(sellPrice("short-sword"))
    expect(result.ok && result.state.bag[0]).toBeNull()
  })

  it("the buyer pays more for monster materials", () => {
    const start = player({ gold: 0, bag: bagWith(["soft-fur", 10]) })
    const there = apply(start, { type: "sell", shop: "buyer", slot: 0, count: 10 })
    const here = apply(start, { type: "sell", shop: "fruit", slot: 0, count: 10 })
    expect(there.ok && here.ok && there.state.gold > here.state.gold).toBe(true)
  })

  it("keeps the shop stole at its ordinary price with its maker", () => {
    const before = player({ gold: 1000 })
    const result = apply(before, { type: "buy", shop: "tailor", item: "fur-stole", count: 1 })
    if (!result.ok) throw Error(result.reason)
    expect(result.state.gold).toBe(before.gold - ITEMS["fur-stole"].price)
    expect(result.state.bag).toContainEqual({ item: "fur-stole", count: 1, q: 1, by: "マグダレーナ" })
  })

  it("every stocked item has a price", () => {
    for (const shop of Object.values(SHOPS)) for (const id of shop.stock) expect(ITEMS[id].price).toBeGreaterThan(0)
  })
})

it.each([
  ["short-sword", 120],
  ["battle-axe", 380],
] as const)("keeps the smith's %s at its existing price with ordinary maker quality", (item, price) => {
  const before = player({ gold: 500 })
  const result = apply(before, { type: "buy", shop: "smithy", item, count: 1 })
  if (!result.ok) throw Error(result.reason)
  expect(result.state.gold).toBe(500 - price)
  expect(result.state.bag).toContainEqual({ item, count: 1, q: 1, by: "ギュンター" })
})

it.each(["tailor", "general", "old-clothes"] as const)("keeps the traveller coat at its existing price in %s", (shop) => {
  const before = player({ gold: 100 })
  const result = apply(before, { type: "buy", shop, item: "traveller-coat", count: 1 })
  if (!result.ok) throw Error(result.reason)
  expect(result.state.gold).toBe(20)
  expect(result.state.bag).toContainEqual({ item: "traveller-coat", count: 1, q: 1, by: "マグダレーナ" })
})
