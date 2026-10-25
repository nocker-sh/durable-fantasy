import { describe, expect, it } from "vitest"
import { BAG_SIZE, addItem, countItem, emptyBag, moveSlot, removeItem, roomFor, type Bag } from "./bag.ts"

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
