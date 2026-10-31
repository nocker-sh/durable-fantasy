import { describe, expect, it } from "vitest"
import type { Bag, Stack } from "#/world/core/bag-types"
import { emptyBag } from "#/world/core/empty-bag"
import { carried } from "#/world/core/inventory-weight"
import { derive } from "#/world/core/derive"
import { receiveItems } from "#/world/core/receive-items"
import { tradeIn } from "#/world/core/trade-in"
import { player } from "#/world/test/player"

describe("incoming inventory", () => {
  it("receives deliveries and trades in order, keeping their distinct events", () => {
    const state = player({ bag: [{ item: "potion", count: 98 }, ...emptyBag(2)], gold: 12 })
    const stacks: readonly Stack[] = [
      { item: "potion", count: 3 },
      { item: "potion", count: 2, q: 0, by: "エルナ" },
    ]
    const expected: Bag = [{ item: "potion", count: 99 }, { item: "potion", count: 2 }, stacks[1]]
    const delivery = receiveItems(state, { type: "receive", items: stacks, gold: 7 })
    const trade = tradeIn(state, { type: "trade-in", stacks, gold: 7 })
    expect(delivery).toEqual({ ok: true, state: { ...state, bag: expected, gold: 19 }, events: [{ type: "received", gold: 7, items: 5 }] })
    expect(trade).toEqual({ ok: true, state: { ...state, bag: expected, gold: 19 }, events: [{ type: "traded-in", stacks, gold: 7 }] })
  })

  it("rejects both entire receipts when a later stack does not fit, including the gold", () => {
    const state = player({ bag: [null], gold: 12 })
    const before = structuredClone(state)
    const stacks: readonly Stack[] = [
      { item: "apple", count: 1 },
      { item: "pear", count: 1 },
    ]
    expect(receiveItems(state, { type: "receive", items: stacks, gold: 7 })).toEqual({ ok: false, reason: "BAG_FULL" })
    expect(tradeIn(state, { type: "trade-in", stacks, gold: 7 })).toEqual({ ok: false, reason: "BAG_FULL" })
    expect(state).toEqual(before)
  })

  it("preserves trade wear without turning unmarked tools into newly made goods", () => {
    const state = player({ bag: emptyBag(2) })
    const stacks: readonly Stack[] = [
      { item: "wood-axe", count: 1, q: 2, by: "エルナ", dur: 3 },
      { item: "wood-axe", count: 1 },
    ]
    const trade = tradeIn(state, { type: "trade-in", stacks, gold: 0 })
    expect(trade.ok && trade.state.bag).toEqual(stacks)
    expect(state.bag).toEqual([null, null])
  })

  it("keeps the trade weight check separate from delivery acceptance", () => {
    const state = player({ bag: emptyBag(3) })
    const stacks: readonly Stack[] = [{ item: "log", count: 297 }]
    expect(carried({ ...state, bag: stacks })).toBeGreaterThan(derive(state).maxWeight)
    expect(receiveItems(state, { type: "receive", items: stacks, gold: 0 }).ok).toBe(true)
    expect(tradeIn(state, { type: "trade-in", stacks, gold: 0 })).toEqual({ ok: false, reason: "TOO_HEAVY" })
  })

  it("checks space before weight and accepts gold alone even when already overloaded", () => {
    const state = player({
      bag: [
        { item: "log", count: 99 },
        { item: "log", count: 99 },
        { item: "log", count: 99 },
      ],
      gold: 12,
    })
    expect(carried(state)).toBeGreaterThan(derive(state).maxWeight)
    expect(tradeIn(state, { type: "trade-in", stacks: [{ item: "apple", count: 1 }], gold: 7 })).toEqual({ ok: false, reason: "BAG_FULL" })
    const trade = tradeIn(state, { type: "trade-in", stacks: [], gold: 7 })
    const delivery = receiveItems(state, { type: "receive", items: [], gold: 7 })
    expect(trade.ok && trade.state.gold).toBe(19)
    expect(delivery.ok && delivery.state.gold).toBe(19)
    expect(trade.ok && trade.state.bag).toBe(state.bag)
    expect(delivery.ok && delivery.state.bag).toBe(state.bag)
  })
})
