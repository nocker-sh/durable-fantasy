import { expect, it } from "vitest"
import { getCarriedSellableItemIds } from "#/world/core/get-carried-sellable-item-ids"
import type { Bag } from "#/world/core/bag-types"

it("keeps first appearance order while excluding keys, empty slots and duplicate item kinds", () => {
  const bag: Bag = [null, { item: "apple", count: 2 }, { item: "sealed-letter", count: 1 }, { item: "log", count: 4 }, { item: "apple", count: 1, q: 2, by: "maker" }]
  const before = structuredClone(bag)
  expect(getCarriedSellableItemIds(bag)).toEqual(["apple", "log"])
  expect(bag).toEqual(before)
})

it("returns no types when there is nothing that can be sold", () => {
  expect(getCarriedSellableItemIds([])).toEqual([])
  expect(getCarriedSellableItemIds([null, { item: "sealed-letter", count: 1 }])).toEqual([])
})
