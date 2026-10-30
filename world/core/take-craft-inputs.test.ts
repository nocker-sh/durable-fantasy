import { expect, it } from "vitest"
import { takeCraftInputs } from "#/world/core/take-craft-inputs"
import type { Bag } from "#/world/core/bag-types"

it("keeps good materials and consumes equal qualities in slot order across repeated requirements", () => {
  const bag: Bag = Object.freeze([Object.freeze({ item: "rye-bread", count: 2, q: 3 }), Object.freeze({ item: "rye-bread", count: 1, q: 0 }), Object.freeze({ item: "rye-bread", count: 2, q: 0 })])
  const used = takeCraftInputs({
    bag,
    inputs: [
      { item: "rye-bread", count: 2 },
      { item: "rye-bread", count: 2 },
    ],
  })

  expect(used).toEqual({ bag: [{ item: "rye-bread", count: 1, q: 3 }, null, null], weight: 3, made: 4 })
  expect(bag.map((stack) => stack?.count)).toEqual([2, 1, 2])
})

it("returns no partial materials when a later requirement is missing", () => {
  const bag: Bag = Object.freeze([Object.freeze({ item: "iron-ingot", count: 1, q: 2 })])

  expect(
    takeCraftInputs({
      bag,
      inputs: [
        { item: "iron-ingot", count: 1 },
        { item: "plank", count: 1 },
      ],
    }),
  ).toBeNull()
  expect(bag).toEqual([{ item: "iron-ingot", count: 1, q: 2 }])
})

it("does not include raw materials in crafted-quality averages", () => {
  const bag: Bag = [{ item: "log", count: 2 }]

  expect(takeCraftInputs({ bag, inputs: [{ item: "log", count: 1 }] })).toEqual({ bag: [{ item: "log", count: 1 }], weight: 0, made: 0 })
})
