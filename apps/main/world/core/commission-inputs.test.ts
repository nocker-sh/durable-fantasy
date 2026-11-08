import { expect, it } from "vitest"
import { apply } from "#/world/core/apply"
import { addItem } from "#/world/core/add-item"
import type { Bag } from "#/world/core/bag-types"
import { COMMISSIONS } from "#/world/core/commissions"
import { emptyBag } from "#/world/core/empty-bag"
import { ITEMS } from "#/world/core/items/catalog"
import { player } from "#/world/test/player"

it("a commission takes the poorest of the made things it needs, keeping the better ones", () => {
  const job = COMMISSIONS.find((entry) => entry.inputs.some((input) => ITEMS[input.item].made))!
  const made = job.inputs.find((input) => ITEMS[input.item].made)!
  // the best copy last in the bag, where taking from the back would reach it first
  const steps = [
    ...job.inputs
      .filter((input) => input !== made)
      .map((input) => (bag: Bag) => addItem({ bag, item: input.item, count: input.count, mark: ITEMS[input.item].made ? { q: 1, by: "アルノルト" } : undefined })),
    (bag: Bag) => addItem({ bag, item: made.item, count: made.count, mark: { q: 0, by: "アルノルト" } }),
    (bag: Bag) => addItem({ bag, item: made.item, count: made.count, mark: { q: 3, by: "アルノルト" } }),
  ]
  const bag = steps.reduce<Bag>((current, step) => step(current)!, emptyBag())
  const state = player({ gold: 100_000, bag })
  const ordered = apply(state, { type: "order", commission: job.id, roll: 0.5 }, { now: 0 })
  if (!ordered.ok) throw new Error(`${job.id}: ${ordered.reason}`)
  const left = ordered.state.bag.filter((stack) => stack?.item === made.item)
  expect(left.map((stack) => stack!.q)).toEqual(Array.from({ length: left.length }, () => 3))
  expect(left.reduce((sum, stack) => sum + stack!.count, 0)).toBe(made.count)
})
