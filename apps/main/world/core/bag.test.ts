import { describe, expect, it } from "vitest"
import { BAG_SIZE } from "#/world/core/bag-rules"
import { addItem } from "#/world/core/add-item"
import { countItem } from "#/world/core/count-item"
import { emptyBag } from "#/world/core/empty-bag"
import { moveSlot } from "#/world/core/move-slot"
import { putStack } from "#/world/core/put-stack"
import { removeItem } from "#/world/core/remove-item"
import { roomFor } from "#/world/core/room-for"
import type { Bag } from "#/world/core/bag-types"

describe("bag", () => {
  it("tops up existing stacks before using empty slots", () => {
    const bag = addItem({ bag: addItem({ bag: emptyBag(), item: "apple", count: 90 })!, item: "apple", count: 20 })!
    expect(bag[0]).toEqual({ item: "apple", count: 99 })
    expect(bag[1]).toEqual({ item: "apple", count: 11 })
    expect(countItem(bag, "apple")).toBe(110)
  })

  it("keeps equipment one per slot", () => {
    const bag = addItem({ bag: emptyBag(), item: "dagger", count: 3 })!
    expect(bag.slice(0, 3).every((s) => s?.item === "dagger" && s.count === 1)).toBe(true)
  })

  it("refuses what does not fit and leaves the bag alone", () => {
    const full = addItem({ bag: emptyBag(), item: "mace", count: BAG_SIZE })!
    expect(roomFor(full, "apple")).toBe(0)
    expect(addItem({ bag: full, item: "apple", count: 1 })).toBeNull()
    expect(addItem({ bag: emptyBag(), item: "apple", count: 0 })).toBeNull()
  })

  it("removes from the back and refuses to go below zero", () => {
    const bag = addItem({ bag: emptyBag(), item: "apple", count: 110 })!
    const less = removeItem({ bag: bag, item: "apple", count: 20 })!
    expect(less[0]).toEqual({ item: "apple", count: 90 })
    expect(less[1]).toBeNull()
    expect(removeItem({ bag: bag, item: "apple", count: 111 })).toBeNull()
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
  const fresh = addItem({ bag: emptyBag(), item: "wood-axe", count: 2 })!
  expect(fresh[0]!.dur).toBeGreaterThan(3)
  expect(fresh[1]).toEqual(fresh[0])
  const worn = { ...fresh[0]!, dur: 3 }
  expect(putStack(emptyBag(), worn)![0]).toEqual(worn)
  expect(putStack(emptyBag(), { item: "wood-axe", count: 1 })![0]).toEqual({ item: "wood-axe", count: 1 })
})
