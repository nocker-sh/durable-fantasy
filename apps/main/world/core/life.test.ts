import { describe, expect, it } from "vitest"
import { RECIPES } from "#/world/core/recipes/catalog"
import { LATER_SPOTS, NODES } from "#/world/core/gather"
import { yieldOf } from "#/world/core/yield-of"
import { ITEMS } from "#/world/core/items/catalog"
import { ITEM_IDS } from "#/world/core/items/item-ids"
import type { ItemId } from "#/world/core/items/catalog"
import { LIFE_CAP, LIFE_SKILLS } from "#/world/core/life-rules"
import { SHOPS } from "#/world/core/shops"

const MILESTONE_ITEMS = ITEM_IDS.filter((id) => ITEMS[id].milestone)
/** Where a milestone thing comes from: gathered at a spot, at a spot not built yet, or made. */
function sources(id: ItemId) {
  return [
    ...NODES.flatMap((n) => n.yields.filter((y) => y.item === id).map((y) => ({ skill: n.skill as string, level: y.level ?? 0 }))),
    ...LATER_SPOTS.filter((s) => s.item === id).map((s) => ({ skill: s.skill as string, level: s.level })),
    ...RECIPES.filter((r) => r.output.item === id).map((r) => ({ skill: r.skill as string, level: r.min })),
  ]
}

describe("what only the practised bring (economy.md §2.1)", () => {
  it("every life skill has its own thing at 16, 32 and 64, and each comes only at its milestone", () => {
    for (const skill of LIFE_SKILLS)
      for (const m of [16, 32, 64]) {
        const mine = MILESTONE_ITEMS.filter((id) => sources(id).some((s) => s.skill === skill && s.level === m))
        expect(mine.length, `${skill} ${m}`).toBeGreaterThan(0)
      }
    for (const id of MILESTONE_ITEMS) {
      const from = sources(id)
      expect(from.length, id).toBeGreaterThan(0)
      for (const s of from) expect(s.level, id).toBe(ITEMS[id].milestone)
    }
  })

  it("cannot be had in v0.1: no shop has them, and no spot gives them to a level within the cap", () => {
    for (const shop of Object.values(SHOPS)) for (const id of shop.stock as readonly ItemId[]) expect(ITEMS[id].milestone, `${shop.name} ${id}`).toBeUndefined()
    for (const n of NODES) for (let i = 0; i < 200; i++) expect(ITEMS[yieldOf({ node: n, level: LIFE_CAP, power: 2, roll: i / 200 }).item].milestone, n.id).toBeUndefined()
    for (const r of RECIPES) if (ITEMS[r.output.item].milestone) expect(r.min).toBeGreaterThan(LIFE_CAP)
  })

  it("are worth more the higher the milestone, so a trade taken far pays", () => {
    for (const skill of LIFE_SKILLS) {
      const at = (m: number) => Math.max(...MILESTONE_ITEMS.filter((id) => sources(id).some((s) => s.skill === skill && s.level === m)).map((id) => ITEMS[id].price))
      expect(at(32), skill).toBeGreaterThan(at(16))
      expect(at(64), skill).toBeGreaterThan(at(32))
    }
  })
})
