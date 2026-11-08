import { describe, expect, it } from "vitest"
import { apply } from "#/world/core/apply"
import { addItem } from "#/world/core/add-item"
import type { Bag } from "#/world/core/bag-types"
import { STATION_RULES } from "#/world/core/crafting-rules"
import { emptyBag } from "#/world/core/empty-bag"
import { NODES } from "#/world/core/gather"
import { ITEMS, type ItemId } from "#/world/core/items/catalog"
import { lifeLevel } from "#/world/core/life-level"
import { lifeThresholds } from "#/world/core/life-thresholds"
import { openYields } from "#/world/core/open-yields"
import { RECIPES } from "#/world/core/recipes/catalog"
import { bagWith } from "#/world/test/bag-with"
import { player } from "#/world/test/player"

const ROLLS = Array.from({ length: 99 }, (_, index) => (index + 1) / 100)

/** Every empty slot taken by one light thing that none of the given items stack with. */
function fill(bag: Bag, avoid: readonly ItemId[]): Bag {
  const fillerId = (Object.keys(ITEMS) as ItemId[]).filter((id) => !avoid.includes(id)).sort((a, b) => ITEMS[a].weight - ITEMS[b].weight)[0]
  const filler = addItem({ bag: emptyBag(), item: fillerId, count: 1 })![0]!
  return bag.map((stack) => stack ?? { ...filler })
}

describe("a full bag refuses before the roll", () => {
  it("a craft whose product would need a slot is refused for every roll, even with one matching quality stacked", () => {
    const recipe = RECIPES.find((entry) => ITEMS[entry.output.item].made && entry.inputs.every((input) => input.count < ITEMS[input.item].stack))!
    const station = STATION_RULES.find((entry) => entry.kind === recipe.station)!
    const base = player({ name: "エルナ" })
    const inputs = bagWith(...recipe.inputs.map((input): [ItemId, number] => [input.item, input.count + 1]))
    const stacked = addItem({ bag: inputs, item: recipe.output.item, count: 1, mark: { q: 2, by: "エルナ" } })!
    const state = {
      ...base,
      gold: station.fee * 3,
      stats: { ...base.stats, str: 40 },
      life: { ...base.life, [recipe.skill]: lifeThresholds[recipe.min] },
      bag: fill(stacked, [recipe.output.item, ...recipe.inputs.map((input) => input.item)]),
    }
    const results = ROLLS.map((roll) => apply(state, { type: "craft", recipe: recipe.id, station: station.id, roll }))
    expect(new Set(results.map((result) => JSON.stringify(result)))).toEqual(new Set([JSON.stringify({ ok: false, reason: "BAG_FULL" })]))
  })

  it("a gather whose result could need a slot is refused for every roll, even with one result already stacked", () => {
    const base = player({ name: "エルナ" })
    const node = NODES.find((entry) => !entry.needsTool && openYields(entry, lifeLevel(base.life[entry.skill])).length >= 2)!
    const open = openYields(node, lifeLevel(base.life[node.skill]))
    const kept = open[open.length - 1].item
    const stacked = addItem({ bag: emptyBag(), item: kept, count: 1, mark: ITEMS[kept].made ? { q: 1, by: "エルナ" } : undefined })!
    const state = {
      ...base,
      bag: fill(
        stacked,
        open.map((yielded) => yielded.item),
      ),
    }
    const results = ROLLS.map((roll) => apply(state, { type: "gather", node: node.id, roll }))
    expect(new Set(results.map((result) => JSON.stringify(result)))).toEqual(new Set([JSON.stringify({ ok: false, reason: "BAG_FULL" })]))
  })
})
