import { expect, it } from "vitest"
import { RECIPES, STATION_RULES } from "./crafting"
import { ITEMS, QUALITY_PRICE, sellPrice, type Slot } from "./items"
import { LIFE_CAP, lifeExpAt } from "./life"
import { apply } from "./apply"
import { loadPlayer } from "./player"
import { emptyBag } from "./bag"
import { bagWith, player } from "../test/helpers"

const equipmentRecipes = RECIPES.filter((recipe) => ITEMS[recipe.output.item].equip)

it("marks every producible equipment item, including later recipes, as made", () => {
  for (const recipe of equipmentRecipes) expect(ITEMS[recipe.output.item].made, recipe.id).toBe(true)
})

it.each(equipmentRecipes.filter((recipe) => recipe.min <= LIFE_CAP))("preserves $id quality and maker through saving, equipping and removing", (recipe) => {
  const base = player()
  const p = player({
    name: "エルナ",
    gold: 1000,
    bag: bagWith(...recipe.inputs.map((input) => [input.item, input.count] as [typeof input.item, number])),
    stats: Object.fromEntries(Object.keys(base.stats).map((key) => [key, 30])) as typeof base.stats,
    life: Object.fromEntries(Object.keys(base.life).map((key) => [key, lifeExpAt(LIFE_CAP)])) as typeof base.life,
  })
  const made = apply(p, { type: "craft", recipe: recipe.id, station: STATION_RULES.find((s) => s.kind === recipe.station)!.id, roll: 0.2 })
  if (!made.ok) throw Error(made.reason)
  const saved = loadPlayer(JSON.parse(JSON.stringify(made.state)))
  const index = saved.bag.findIndex((s) => s?.item === recipe.output.item)
  const original = saved.bag[index]!
  expect(original).toMatchObject({ by: "エルナ" })
  expect(original.q).toBe(2)
  const equipped = apply(saved, { type: "equip", slot: index })
  if (!equipped.ok) throw Error(equipped.reason)
  const slot = Object.entries(equipped.state.equipment).find(([, id]) => id === recipe.output.item)![0] as Slot
  const removed = apply(loadPlayer(JSON.parse(JSON.stringify(equipped.state))), { type: "unequip", slot })
  if (!removed.ok) throw Error(removed.reason)
  expect(removed.state.bag).toContainEqual(original)
  const soldSlot = removed.state.bag.findIndex((s) => s?.item === original.item && s.by === original.by && s.q === original.q)
  const sold = apply(removed.state, { type: "sell", shop: "general", slot: soldSlot, count: 1 })
  if (!sold.ok) throw Error(sold.reason)
  expect(sold.state.gold - removed.state.gold).toBe(Math.max(1, Math.floor(sellPrice(original.item) * QUALITY_PRICE[original.q!])))
})

it.each(["dagger", "leather-armor", "chain-mail", "cloth-hat", "iron-helm", "leather-boots"] as const)("loads existing unmarked %s without resetting the character", (item) => {
  const p = player({ name: "エルナ", gold: 1234, bag: emptyBag().map((_, index) => (index === 0 ? { item, count: 1 } : null)) })
  const loaded = loadPlayer(JSON.parse(JSON.stringify(p)))
  expect(loaded.gold).toBe(1234)
  expect(loaded.name).toBe("エルナ")
  expect(loaded.bag[0]).toEqual({ item, count: 1 })
})

it.each([false, true])("switches from a worn axe and shield atomically when extra bag space is %s", (hasSpace) => {
  const base = player()
  const before = player({
    stats: { ...base.stats, str: 30, dex: 30 },
    life: { ...base.life, woodcutting: lifeExpAt(4) },
    bag: emptyBag().map((_, index) => (index === 0 ? { item: "spear", count: 1, q: 2, by: "エルナ" } : hasSpace && index === 23 ? null : { item: "dagger", count: 1 })),
    equipment: { ...base.equipment, weapon: "wood-axe", shield: "wooden-shield" },
    worn: { weapon: { q: 2, by: "ギュンター", dur: 7 }, shield: { q: 1, by: "ゴットフリート" } },
  })
  const snapshot = structuredClone(before)
  const result = apply(before, { type: "equip", slot: 0 })
  expect(before).toEqual(snapshot)
  if (!hasSpace) {
    expect(result).toEqual({ ok: false, reason: "BAG_FULL" })
    return
  }
  if (!result.ok) throw Error(result.reason)
  expect(result.state.equipment).toMatchObject({ weapon: "spear", shield: null })
  expect(result.state.worn.weapon).toEqual({ q: 2, by: "エルナ" })
  expect(result.state.worn.shield).toBeUndefined()
  expect(result.state.bag).toContainEqual({ item: "wood-axe", count: 1, q: 2, by: "ギュンター", dur: 7 })
  expect(result.state.bag).toContainEqual({ item: "wooden-shield", count: 1, q: 1, by: "ゴットフリート" })
})
