import { describe, expect, it } from "vitest"
import type { Bag } from "#/world/core/bag-types"
import { removeItem } from "#/world/core/remove-item"

const bag: Bag = Object.freeze([
  Object.freeze({ item: "potion", count: 5, q: 1, by: "エルナ" }),
  null,
  Object.freeze({ item: "apple", count: 8 }),
  Object.freeze({ item: "potion", count: 3, q: 2, by: "エルナ" }),
  Object.freeze({ item: "potion", count: 2, q: 1, by: "オットー" }),
  Object.freeze({ item: "potion", count: 4, q: 1, by: "エルナ" }),
])

describe("removeItem", () => {
  it("consumes the last matching stacks first without changing the source", () => {
    const before = structuredClone(bag)
    expect(removeItem({ bag, item: "potion", count: 7 })).toEqual([bag[0], null, bag[2], { ...bag[3], count: 2 }, null, null])
    expect(bag).toEqual(before)
  })

  it("filters by quality and maker while retaining unrelated slots", () => {
    expect(removeItem({ bag, item: "potion", count: 6, mark: { q: 1, by: "エルナ" } })).toEqual([{ ...bag[0], count: 3 }, null, bag[2], bag[3], bag[4], null])
  })

  it("accepts partial quality and maker filters", () => {
    expect(removeItem({ bag, item: "potion", count: 6, mark: { q: 1 } })).toEqual([bag[0], null, bag[2], bag[3], null, null])
    expect(removeItem({ bag, item: "potion", count: 7, mark: { by: "エルナ" } })).toEqual([bag[0], null, bag[2], null, bag[4], null])
  })

  it("empties all matching slots when the requested quantity is exact", () => {
    expect(removeItem({ bag, item: "potion", count: 14 })).toEqual([null, null, bag[2], null, null, null])
  })

  it("discards partial consumption when matching stock is insufficient", () => {
    const before = structuredClone(bag)
    expect(removeItem({ bag, item: "potion", count: 10, mark: { q: 1, by: "エルナ" } })).toBeNull()
    expect(removeItem({ bag, item: "pear", count: 1 })).toBeNull()
    expect(removeItem({ bag: [], item: "potion", count: 1 })).toBeNull()
    expect(bag).toEqual(before)
  })

  it.each([0, -1, 1.5, NaN, Infinity])("rejects invalid quantity %s", (count) => {
    expect(removeItem({ bag, item: "potion", count })).toBeNull()
  })

  it("distinguishes quality zero from an unmarked item", () => {
    const goods: Bag = [
      { item: "potion", count: 2, q: 0 },
      { item: "potion", count: 2 },
    ]
    expect(removeItem({ bag: goods, item: "potion", count: 1, mark: { q: 0 } })).toEqual([{ item: "potion", count: 1, q: 0 }, goods[1]])
  })

  it("preserves metadata of tools not consumed", () => {
    const tools: Bag = [
      { item: "wood-axe", count: 1, q: 2, by: "エルナ", dur: 3 },
      { item: "wood-axe", count: 1, q: 2, by: "エルナ", dur: 7 },
    ]
    expect(removeItem({ bag: tools, item: "wood-axe", count: 1 })).toEqual([tools[0], null])
  })
})
