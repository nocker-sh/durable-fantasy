import { expect, it } from "vitest"
import { apply } from "./apply"
import { countItem } from "./bag"
import { RECIPES, stationOf } from "./crafting"
import { lifeExpAt } from "./life"
import { ITEMS, sellPrice } from "./items"
import { artsOf } from "./skills"
import { bagWith, player } from "../test/helpers"

it.each(["fang-charm", "hand-axe", "battle-axe", "spear", "mace", "short-sword"])("turns gathered materials into usable %s with maker and quality", (id) => {
  const recipe = RECIPES.find((r) => r.id === id)!
  const station = id === "fang-charm" ? "workshop-loom" : "craft-forge"
  const p = player({
    name: "エルナ",
    gold: 100,
    bag: bagWith(...recipe.inputs.map(({ item, count }) => [item, count] as [typeof item, number])),
    life: { ...player().life, [recipe.skill]: lifeExpAt(recipe.min + 1) },
    stats: { ...player().stats, str: 16, dex: 12 },
  })
  const command = { type: "craft" as const, recipe: id, station, roll: 0.5 }
  expect(apply({ ...p, life: player().life }, command)).toEqual({ ok: false, reason: "NOT_SKILLED" })
  const result = apply(p, command)
  expect(result.ok).toBe(true)
  if (!result.ok) throw Error(result.reason)
  for (const input of recipe.inputs) expect(countItem(result.state.bag, input.item)).toBe(0)
  const slot = result.state.bag.findIndex((s) => s?.item === recipe.output.item)
  expect(result.state.bag[slot]).toMatchObject({ item: id, count: 1, by: "エルナ" })
  expect(result.state.bag[slot]?.q).toBeDefined()
  expect(result.state.gold).toBe(p.gold - stationOf(station)!.fee)
  const equipped = apply(result.state, { type: "equip", slot })
  expect(equipped.ok).toBe(true)
  if (!equipped.ok) throw Error(equipped.reason)
  expect(Object.values(equipped.state.equipment)).toContain(id)
  if (id !== "fang-charm") {
    const skill = artsOf(recipe.output.item)[0]
    expect(skill).toBeDefined()
    const attack = apply(equipped.state, { type: "art", skill }, { now: Date.now() })
    if (!attack.ok) throw Error(attack.reason)
    expect(attack.state.sp).toBeLessThan(equipped.state.sp)
    expect(attack.events).toContainEqual({ type: "art", skill })
  }
  const inputCost = recipe.inputs.reduce((sum, input) => sum + ITEMS[input.item].price * input.count, 0) + stationOf(station)!.fee
  expect(sellPrice(recipe.output.item)).toBeLessThan(inputCost)
})
