import { emptyEquipment } from "#/world/core/empty-equipment"
import { loadPlayer } from "#/world/core/load-player"
import { describe, expect, it } from "vitest"
import { apply } from "#/world/core/apply"
import { addItem } from "#/world/core/add-item"
import { countItem } from "#/world/core/count-item"
import { emptyBag } from "#/world/core/empty-bag"
import { STORAGE_KEEPER, STORAGE_SIZE, STORE_FEE } from "#/world/core/storage/rules"
import { ITEMS } from "#/world/core/items/catalog"
import { FRIEND } from "#/world/core/friendship-rules"
import { derive } from "#/world/core/derive"
import { storageOpen } from "#/world/town/warehouse"
import { bagWith } from "#/world/test/bag-with"
import { player } from "#/world/test/player"

describe("the town warehouse", () => {
  it("leave a lot for a small charge, take it back for nothing", () => {
    const p = player({ gold: 20, bag: bagWith(["herb", 7]) })
    const stored = apply(p, { type: "store", slot: 0, count: 7, expectedStack: p.bag[0] }, { now: 1 })
    expect(stored.ok).toBe(true)
    if (!stored.ok) return
    expect(countItem(stored.state.bag, "herb")).toBe(0)
    expect(countItem(stored.state.storage, "herb")).toBe(7)
    expect(stored.state.gold).toBe(20 - STORE_FEE)
    const back = apply(stored.state, { type: "retrieve", index: 0, count: 3, expectedStack: stored.state.storage[0] }, { now: 2 })
    expect(back.ok && countItem(back.state.bag, "herb")).toBe(3)
    expect(back.ok && countItem(back.state.storage, "herb")).toBe(4)
    expect(back.ok && back.state.gold).toBe(20 - STORE_FEE)
  })

  it("a worn tool comes back as worn as it went in", () => {
    const bag = [...emptyBag()]
    bag[0] = { item: "wood-axe", count: 1, q: 1, by: "ギュンター", dur: 3 }
    const p = player({ gold: 20, bag })
    const stored = apply(p, { type: "store", slot: 0, count: 1, expectedStack: p.bag[0] }, { now: 1 })
    const back = stored.ok ? apply(stored.state, { type: "retrieve", index: 0, count: 1, expectedStack: stored.state.storage[0] }, { now: 2 }) : stored
    expect(back.ok && back.state.bag[0]).toEqual({ item: "wood-axe", count: 1, q: 1, by: "ギュンター", dur: 3 })
  })

  it("refuses what cannot be kept, a full warehouse, and no money for the charge", () => {
    const letter = player({ gold: 20, bag: addItem({ bag: emptyBag(), item: "sealed-letter", count: 1 })! })
    expect(apply(letter, { type: "store", slot: 0, count: 1, expectedStack: letter.bag[0] }, { now: 1 })).toEqual({ ok: false, reason: "NOT_STORABLE" })
    const full = player({ gold: 20, bag: bagWith(["herb", 1]), storage: Array.from({ length: STORAGE_SIZE }, () => ({ item: "log" as const, count: 99 })) })
    expect(apply(full, { type: "store", slot: 0, count: 1, expectedStack: full.bag[0] }, { now: 1 })).toEqual({ ok: false, reason: "STORAGE_FULL" })
    const poor = player({ gold: 0, bag: bagWith(["herb", 1]) })
    expect(apply(poor, { type: "store", slot: 0, count: 1, expectedStack: poor.bag[0] }, { now: 1 })).toEqual({ ok: false, reason: "NO_GOLD" })
  })

  it("open while Hilde is at her counter, not while she sleeps", () => {
    expect(storageOpen(20 * 60)).toBe(true)
    expect(storageOpen(10 * 60)).toBe(false)
  })
})

it("keeps an old unmarked stole unchanged through storage and save reload", () => {
  const original = { item: "fur-stole", count: 1 } as const
  const start = player({ gold: 20, bag: [original, ...emptyBag(23)] })
  const stored = apply(start, { type: "store", slot: 0, count: 1, expectedStack: start.bag[0] }, { now: 1 })
  if (!stored.ok) throw Error(stored.reason)
  expect(stored.state.storage[0]).toEqual(original)
  const saved = loadPlayer(JSON.parse(JSON.stringify(stored.state)))
  const taken = apply(saved, { type: "retrieve", index: 0, count: 1, expectedStack: saved.storage[0] }, { now: 2 })
  if (!taken.ok) throw Error(taken.reason)
  expect(taken.state.bag[0]).toEqual(original)
  expect(taken.state.storage[0]).toBeNull()
})

it("allows a partial withdrawal when the whole lot exceeds bag capacity", () => {
  const p = player({ equipment: emptyEquipment(), bag: Array.from({ length: 24 }, (_, i) => ({ item: "herb", count: i === 0 ? 98 : 99 })), storage: bagWith(["herb", 7]) })
  const start = { ...p, stats: { ...p.stats, str: 100 } }
  expect(apply(start, { type: "retrieve", index: 0, count: 7, expectedStack: start.storage[0] }, { now: 1 })).toEqual({ ok: false, reason: "BAG_FULL" })
  const result = apply(start, { type: "retrieve", index: 0, count: 1, expectedStack: start.storage[0] }, { now: 1 })
  if (!result.ok) throw Error(result.reason)
  expect(result.state.bag[0]?.count).toBe(99)
  expect(result.state.storage[0]?.count).toBe(6)
  expect(p.storage[0]?.count).toBe(7)
})

it("allows only the part of a stored lot that fits the carrying weight", () => {
  const p = player({ equipment: emptyEquipment(), storage: bagWith(["log", 10]) })
  const capacity = Math.floor(derive(p).maxWeight / ITEMS.log.weight)
  const start = { ...p, bag: bagWith(["log", capacity - 1]) }
  expect(apply(start, { type: "retrieve", index: 0, count: 2, expectedStack: start.storage[0] }, { now: 1 })).toEqual({ ok: false, reason: "TOO_HEAVY" })
  const result = apply(start, { type: "retrieve", index: 0, count: 1, expectedStack: start.storage[0] }, { now: 1 })
  if (!result.ok) throw Error(result.reason)
  expect(countItem(result.state.bag, "log")).toBe(capacity)
  expect(result.state.storage[0]?.count).toBe(9)
})

it("charges every deposit but rewards friendship only once per day, never for a rejected deposit or withdrawal", () => {
  const now = Date.UTC(2026, 0, 1, 12)
  let state = player({ gold: 100, bag: bagWith(["herb", 4]) })
  for (const [time, friendship] of [
    [now, FRIEND.bought],
    [now + 1, FRIEND.bought],
    [now + 86_400_000, FRIEND.bought * 2],
  ]) {
    const result = apply(state, { type: "store", slot: 0, count: 1, expectedStack: state.bag[0] }, { now: time })
    if (!result.ok) throw Error(result.reason)
    expect(result.state.gold).toBe(state.gold - STORE_FEE)
    expect(result.state.friends[STORAGE_KEEPER]).toBe(friendship)
    state = loadPlayer(JSON.parse(JSON.stringify(result.state)))
  }
  const before = structuredClone(state)
  expect(apply(state, { type: "store", slot: 0, count: 2, expectedStack: state.bag[0] }, { now: now + 2 * 86_400_000 })).toEqual({ ok: false, reason: "NOT_ENOUGH" })
  expect(state).toEqual(before)
  const withdrawn = apply(state, { type: "retrieve", index: 0, count: 3, expectedStack: state.storage[0] }, { now: now + 2 * 86_400_000 })
  if (!withdrawn.ok) throw Error(withdrawn.reason)
  expect(withdrawn.state.gold).toBe(state.gold)
  expect(withdrawn.state.friends).toEqual(state.friends)
  expect(withdrawn.state.boughtOn).toEqual(state.boughtOn)
})
