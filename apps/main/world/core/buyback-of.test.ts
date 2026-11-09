import { expect, it } from "vitest"
import { buybackOf } from "#/world/core/buyback-of"
import { fullDurability } from "#/world/core/full-durability"
import { ITEMS } from "#/world/core/items/catalog"
import { ITEM_IDS } from "#/world/core/items/item-ids"
import { QUALITIES, QUALITY_PRICE } from "#/world/core/items/kinds"
import type { Quality } from "#/world/core/items/kinds"

const tools = ITEM_IDS.filter((id) => ITEMS[id].tool).flatMap((item) => [...QUALITIES.keys()].map((q) => ({ item, q: q as Quality })))

it.each(tools)("$item@$q: pays a worn tool only for the share of its uses left", (tool) => {
  const full = fullDurability(tool.item, tool.q)
  if (!full) throw Error(`${tool.item}: no durability`)
  for (const price of [1, 18, 420]) {
    const unworn = Math.max(1, Math.floor(price * Math.min(1, QUALITY_PRICE[tool.q])))
    expect(buybackOf(price, { ...tool, dur: full })).toBe(unworn)
    // a tool with no wear recorded is priced as new, as the shelf and the item notes show it
    expect(buybackOf(price, tool)).toBe(unworn)
    const paid = Array.from({ length: full }, (_, index) => buybackOf(price, { ...tool, dur: index + 1 }))
    expect(paid.every((each, index) => each >= 1 && each <= unworn && (index === 0 || each >= paid[index - 1]))).toBe(true)
    expect(paid[0]).toBe(Math.max(1, Math.floor((price * Math.min(1, QUALITY_PRICE[tool.q])) / full)))
    expect(buybackOf(price, { ...tool, dur: Math.floor(full / 2) })).toBe(Math.max(1, Math.floor((price * Math.min(1, QUALITY_PRICE[tool.q]) * Math.floor(full / 2)) / full)))
  }
})

it("pays an axe with one use left the least there is, not the new price", () => {
  expect(buybackOf(18, { item: "wood-axe", q: 1, dur: 40 })).toBe(18)
  expect(buybackOf(18, { item: "wood-axe", q: 1, dur: 20 })).toBe(9)
  expect(buybackOf(18, { item: "wood-axe", q: 1, dur: 1 })).toBe(1)
})

it("leaves things that do not wear as they were", () => {
  expect(buybackOf(30, { item: "short-sword", q: 2 })).toBe(30)
  expect(buybackOf(30, { item: "short-sword", q: 0 })).toBe(22)
  expect(buybackOf(5, { item: "herb" })).toBe(5)
})
