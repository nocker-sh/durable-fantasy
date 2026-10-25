import { describe, expect, it } from "vitest"
import { apply } from "./apply.ts"
import { addItem, countItem, emptyBag } from "./bag.ts"
import { STORAGE_SIZE, STORE_FEE } from "./storage.ts"
import { storageOpen } from "../town/warehouse.ts"
import { bagWith, player } from "../test/helpers.ts"

describe("the town warehouse", () => {
  it("leave a lot for a small charge, take it back for nothing", () => {
    const p = player({ gold: 20, bag: bagWith(["herb", 7]) })
    const stored = apply(p, { type: "store", slot: 0, count: 7 }, { now: 1 })
    expect(stored.ok).toBe(true)
    if (!stored.ok) return
    expect(countItem(stored.state.bag, "herb")).toBe(0)
    expect(countItem(stored.state.storage, "herb")).toBe(7)
    expect(stored.state.gold).toBe(20 - STORE_FEE)
    const back = apply(stored.state, { type: "retrieve", index: 0, count: 3 }, { now: 2 })
    expect(back.ok && countItem(back.state.bag, "herb")).toBe(3)
    expect(back.ok && countItem(back.state.storage, "herb")).toBe(4)
    expect(back.ok && back.state.gold).toBe(20 - STORE_FEE)
  })

  it("a worn tool comes back as worn as it went in", () => {
    const bag = [...emptyBag()]
    bag[0] = { item: "wood-axe", count: 1, q: 1, by: "ギュンター", dur: 3 }
    const p = player({ gold: 20, bag })
    const stored = apply(p, { type: "store", slot: 0, count: 1 }, { now: 1 })
    const back = stored.ok ? apply(stored.state, { type: "retrieve", index: 0, count: 1 }, { now: 2 }) : stored
    expect(back.ok && back.state.bag[0]).toEqual({ item: "wood-axe", count: 1, q: 1, by: "ギュンター", dur: 3 })
  })

  it("refuses what cannot be kept, a full warehouse, and no money for the charge", () => {
    const letter = player({ gold: 20, bag: addItem(emptyBag(), "sealed-letter", 1)! })
    expect(apply(letter, { type: "store", slot: 0, count: 1 }, { now: 1 })).toEqual({ ok: false, reason: "NOT_STORABLE" })
    const full = player({ gold: 20, bag: bagWith(["herb", 1]), storage: Array.from({ length: STORAGE_SIZE }, () => ({ item: "log" as const, count: 99 })) })
    expect(apply(full, { type: "store", slot: 0, count: 1 }, { now: 1 })).toEqual({ ok: false, reason: "STORAGE_FULL" })
    expect(apply(player({ gold: 0, bag: bagWith(["herb", 1]) }), { type: "store", slot: 0, count: 1 }, { now: 1 })).toEqual({ ok: false, reason: "NO_GOLD" })
  })

  it("open while Hilde is at her counter, not while she sleeps", () => {
    expect(storageOpen(20 * 60)).toBe(true)
    expect(storageOpen(10 * 60)).toBe(false)
  })
})
