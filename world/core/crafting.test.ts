import { describe, expect, it } from "vitest"
import { apply } from "./apply.ts"
import { addItem, countItem, emptyBag, type Bag } from "./bag.ts"
import { RECIPES, craftedQuality, recipeOf } from "./crafting.ts"
import { STATIONS } from "../town/stations.ts"
import { ITEMS, type ItemId } from "./items.ts"
import { MAPS, walkable } from "../maps/index.ts"
import { player } from "../test/helpers.ts"
import { craftExp, lifeExpAt } from "./life.ts"

const at = (skill: string, level: number) => ({ ...player().life, [skill]: lifeExpAt(level) })

const bag = (...items: [ItemId, number][]): Bag => items.reduce<Bag>((b, [id, n]) => addItem(b, id, n)!, emptyBag())

describe("making things", () => {
  it("cooks soup at the hearth: takes the inputs and the fee, gives the soup with your name on it", () => {
    const p = player({ name: "シグレニ", gold: 100, bag: bag(["cabbage", 1], ["onion", 1], ["firewood", 1]) })
    const r = apply(p, { type: "craft", recipe: "cabbage-soup", station: "workshop-hearth", roll: 0.5 })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(countItem(r.state.bag, "cabbage")).toBe(0)
    expect(r.state.bag.find((s) => s?.item === "cabbage-soup")).toMatchObject({ count: 2, by: "シグレニ" })
    expect(r.state.gold).toBe(99)
    expect(r.state.life.cooking).toBe(craftExp(0))
  })

  it("an axe needs the smith's iron and the woodworker's plank, and the forge", () => {
    const p = player({ gold: 100, life: at("smithing", 2), bag: bag(["iron-ingot", 1], ["plank", 1]) })
    expect(apply(p, { type: "craft", recipe: "wood-axe", station: "workshop-bench", roll: 0.5 })).toEqual({ ok: false, reason: "WRONG_STATION" })
    const r = apply(p, { type: "craft", recipe: "wood-axe", station: "craft-forge", roll: 0.5 })
    expect(r.ok && r.state.bag.find((s) => s?.item === "wood-axe")?.dur).toBeGreaterThan(0)
    expect(apply(player({ gold: 100, bag: bag(["iron-ingot", 1]) }), { type: "craft", recipe: "wood-axe", station: "craft-forge", roll: 0.5 }).ok).toBe(false)
  })

  it("refuses without the skill, the money or the materials", () => {
    expect(apply(player({ gold: 100, bag: bag(["hot-milk", 1], ["carrot", 1], ["turnip", 1], ["firewood", 1]) }), { type: "craft", recipe: "stew", station: "workshop-hearth", roll: 0.5 })).toEqual({
      ok: false,
      reason: "NOT_SKILLED",
    })
    expect(apply(player({ gold: 0, bag: bag(["log", 1]) }), { type: "craft", recipe: "plank", station: "workshop-bench", roll: 0.5 })).toEqual({ ok: false, reason: "NO_GOLD" })
    expect(apply(player({ gold: 100 }), { type: "craft", recipe: "plank", station: "workshop-bench", roll: 0.5 })).toEqual({ ok: false, reason: "MISSING_INPUTS" })
  })

  it("better hands and better materials make better things", () => {
    const share = (level: number, input: number) => Array.from({ length: 1000 }, (_, i) => craftedQuality(level, input, i / 1000)).filter((q) => q >= 2).length
    expect(share(8, 1)).toBeGreaterThan(share(0, 1))
    expect(share(4, 2)).toBeGreaterThan(share(4, 1))
    expect(share(0, 1)).toBeLessThan(200)
  })

  it("every recipe's things exist, nothing makes itself from itself, and every station stands somewhere you can be", () => {
    expect(new Set(RECIPES.map((recipe) => recipe.id)).size).toBe(RECIPES.length)
    expect(recipeOf("missing-recipe")).toBeUndefined()
    for (const rec of RECIPES) {
      expect(recipeOf(rec.id)).toBe(rec)
      expect(ITEMS[rec.output.item], rec.id).toBeDefined()
      for (const i of rec.inputs) {
        expect(ITEMS[i.item], `${rec.id}: ${i.item}`).toBeDefined()
        expect(i.item).not.toBe(rec.output.item)
      }
      expect(
        STATIONS.some((s) => s.kind === rec.station),
        rec.id,
      ).toBe(true)
      // every recipe opens at a milestone (game-system.md §9.1)
      expect([0, 2, 4, 8, 16, 32, 64], rec.id).toContain(rec.min)
    }
    for (const s of STATIONS) {
      expect(MAPS[s.map], s.id).toBeDefined()
      expect(s.cell[0] < MAPS[s.map].size, s.id).toBe(true)
    }
    void walkable
  })
})

describe("an unpractised hand", () => {
  it("spoils some of what it makes; a practised one does not", () => {
    const p = player({ gold: 100, bag: bag(["log", 1]) })
    const r = apply(p, { type: "craft", recipe: "plank", station: "workshop-bench", roll: 0.7 }) // the dice come up badly
    expect(r.ok && r.events[0].type).toBe("spoiled")
    expect(r.ok && countItem(r.state.bag, "log")).toBe(0)
    const skilled = apply(player({ gold: 100, bag: bag(["log", 1]), life: at("carpentry", 3) }), { type: "craft", recipe: "plank", station: "workshop-bench", roll: 0.7 })
    expect(skilled.ok && skilled.events[0].type).toBe("crafted")
  })
})
