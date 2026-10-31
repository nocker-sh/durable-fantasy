import { describe, expect, it } from "vitest"
import type { Bag, Stack } from "#/world/core/bag-types"
import { putStacks } from "#/world/core/put-stacks"

describe("putStacks", () => {
  it("fills existing stacks before empty slots, preserving incoming order and marks", () => {
    const bag: Bag = Object.freeze([null, Object.freeze({ item: "potion", count: 98 }), null, null])
    const stacks: readonly Stack[] = Object.freeze([
      Object.freeze({ item: "potion", count: 3 }),
      Object.freeze({ item: "potion", count: 2, q: 0, by: "エルナ" }),
      Object.freeze({ item: "wood-axe", count: 1, dur: 3 }),
    ])
    expect(putStacks(bag, stacks)).toEqual([{ item: "potion", count: 2 }, { item: "potion", count: 99 }, stacks[1], stacks[2]])
    expect(bag).toEqual([null, { item: "potion", count: 98 }, null, null])
  })

  it("discards a partial receipt without mutating existing or incoming stacks", () => {
    const bag: Bag = Object.freeze([Object.freeze({ item: "apple", count: 98 }), null])
    const stacks: readonly Stack[] = Object.freeze([Object.freeze({ item: "apple", count: 2 }), Object.freeze({ item: "pear", count: 1 })])
    expect(putStacks(bag, stacks)).toBeNull()
    expect(bag).toEqual([{ item: "apple", count: 98 }, null])
    expect(stacks).toEqual([
      { item: "apple", count: 2 },
      { item: "pear", count: 1 },
    ])
  })

  it.each([0, -1, 1.5, NaN, Infinity])("rejects an invalid later quantity %s", (count) => {
    const bag: Bag = [null, null]
    expect(
      putStacks(bag, [
        { item: "apple", count: 1 },
        { item: "pear", count },
      ]),
    ).toBeNull()
    expect(bag).toEqual([null, null])
  })

  it("keeps the original bag for an empty receipt, including a full or empty bag", () => {
    for (const bag of [[], [{ item: "apple", count: 99 }]] satisfies Bag[]) expect(putStacks(bag, [])).toBe(bag)
    expect(putStacks([], [{ item: "apple", count: 1 }])).toBeNull()
  })
})
