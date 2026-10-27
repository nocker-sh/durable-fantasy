import { describe, expect, it } from "vitest"
import { BAG_SIZE, addItem, countItem, emptyBag, moveSlot, putStack, removeItem, roomFor, type Bag } from "./bag.ts"

describe("bag", () => {
  it("tops up existing stacks before using empty slots", () => {
    const bag = addItem(addItem(emptyBag(), "apple", 90)!, "apple", 20)!
    expect(bag[0]).toEqual({ item: "apple", count: 99 })
    expect(bag[1]).toEqual({ item: "apple", count: 11 })
    expect(countItem(bag, "apple")).toBe(110)
  })

  it("keeps equipment one per slot", () => {
    const bag = addItem(emptyBag(), "dagger", 3)!
    expect(bag.slice(0, 3).every((s) => s?.item === "dagger" && s.count === 1)).toBe(true)
  })

  it("refuses what does not fit and leaves the bag alone", () => {
    const full = addItem(emptyBag(), "mace", BAG_SIZE)!
    expect(roomFor(full, "apple")).toBe(0)
    expect(addItem(full, "apple", 1)).toBeNull()
    expect(addItem(emptyBag(), "apple", 0)).toBeNull()
  })

  it("removes from the back and refuses to go below zero", () => {
    const bag = addItem(emptyBag(), "apple", 110)!
    const less = removeItem(bag, "apple", 20)!
    expect(less[0]).toEqual({ item: "apple", count: 90 })
    expect(less[1]).toBeNull()
    expect(removeItem(bag, "apple", 111)).toBeNull()
  })

  it("tops up a matching stack when dragged onto it, swaps when it is full or different", () => {
    let bag: Bag = [{ item: "apple", count: 95 }, { item: "apple", count: 8 }, { item: "pear", count: 1 }, ...emptyBag(BAG_SIZE - 3)]
    bag = moveSlot(bag, 1, 0)!
    expect(bag[0]).toEqual({ item: "apple", count: 99 })
    expect(bag[1]).toEqual({ item: "apple", count: 4 })
    expect(moveSlot(bag, 1, 0)![0]).toEqual({ item: "apple", count: 4 })
    expect(moveSlot(bag, 2, 0)![0]?.item).toBe("pear")
    expect(moveSlot(bag, 5, 0)).toBeNull()
  })
})

it("moves unmarked goods without inventing a maker or merging into marked goods", () => {
  const bag: Bag = [{ item: "potion", count: 98 }, { item: "potion", count: 90, q: 1, by: "イルムガルト" }, null]
  const before = structuredClone(bag)
  const moved = putStack(bag, { item: "potion", count: 3 })
  expect(moved).toEqual([{ item: "potion", count: 99 }, bag[1], { item: "potion", count: 2 }])
  expect(bag).toEqual(before)
  expect(putStack(bag.slice(0, 2), { item: "potion", count: 3 })).toBeNull()
  expect(bag).toEqual(before)
})

it("generates new tools with full durability but preserves transferred wear", () => {
  const fresh = addItem(emptyBag(), "wood-axe", 2)!
  expect(fresh[0]!.dur).toBeGreaterThan(3)
  expect(fresh[1]).toEqual(fresh[0])
  const worn = { ...fresh[0]!, dur: 3 }
  expect(putStack(emptyBag(), worn)![0]).toEqual(worn)
  expect(putStack(emptyBag(), { item: "wood-axe", count: 1 })![0]).toEqual({ item: "wood-axe", count: 1 })
})
