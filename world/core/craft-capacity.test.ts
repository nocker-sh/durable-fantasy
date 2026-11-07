import { expect, it } from "vitest"
import { apply } from "#/world/core/apply"
import { addItem } from "#/world/core/add-item"
import type { Bag, Stack } from "#/world/core/bag-types"
import { countItem } from "#/world/core/count-item"
import { STATION_RULES, STAMINA_PER_CRAFT } from "#/world/core/crafting-rules"
import { derive } from "#/world/core/derive"
import { emptyBag } from "#/world/core/empty-bag"
import { carried } from "#/world/core/inventory-weight"
import { ITEMS, type ItemId } from "#/world/core/items/catalog"
import { lifeThresholds } from "#/world/core/life-thresholds"
import { parsePlayer } from "#/world/core/parse-player"
import { RECIPES } from "#/world/core/recipes/catalog"
import { bagWith } from "#/world/test/bag-with"
import { player } from "#/world/test/player"

it.each(RECIPES)("$id: capacity refusal, a freed material slot and compatible output stacks preserve the craft transaction", (recipe) => {
  const station = STATION_RULES.find((entry) => entry.kind === recipe.station)!
  const base = player()
  // Skills, strength and inventory layout are local starting conditions. All
  // deductions, quality, stacking and decisions use the actual craft dispatcher.
  const state = player({
    name: "エルナ",
    gold: station.fee * 3,
    stats: { ...base.stats, str: 40 },
    life: { ...base.life, [recipe.skill]: lifeThresholds[recipe.min] },
    bag: bagWith(...recipe.inputs.map((input): [ItemId, number] => [input.item, input.count + 1])),
  })
  const command = { type: "craft" as const, recipe: recipe.id, station: station.id, roll: 0.5 }
  // Surplus stackable materials keep their slot; consuming individual equipment
  // can release slots even with another copy left. Do not exclude such recipes.
  const releasedSlots = recipe.inputs.reduce((sum, input) => sum + Math.floor(input.count / ITEMS[input.item].stack), 0)
  const limit = ITEMS[recipe.output.item].stack
  expect(recipe.output.count).toBeLessThanOrEqual(limit)
  const fillerId = (Object.keys(ITEMS) as ItemId[]).filter((id) => id !== recipe.output.item && !recipe.inputs.some((input) => input.item === id)).sort((a, b) => ITEMS[a].weight - ITEMS[b].weight)[0]
  const filler = addItem({ bag: emptyBag(), item: fillerId, count: 1 })![0]!
  const full: Bag = state.bag.map((stack) => stack ?? { ...filler })
  const blocked = { ...state, bag: full }
  expect(blocked.bag.every(Boolean)).toBe(true)
  expect(carried(blocked)).toBeLessThanOrEqual(derive(blocked).maxWeight)
  const before = structuredClone(blocked)
  expect(parsePlayer(JSON.parse(JSON.stringify(before)))).toEqual(before)
  const fullResult = apply(blocked, command)
  if (releasedSlots === 0) expect(fullResult).toEqual({ ok: false, reason: "BAG_FULL" })
  else {
    if (!fullResult.ok) throw new Error(`${recipe.id}: consumed equipment slot rejected with ${fullResult.reason}`)
    expect(fullResult.events[0].type).toBe("crafted")
    expect(fullResult.state.gold).toBe(blocked.gold - station.fee)
    expect(fullResult.state.stamina).toBe(blocked.stamina - STAMINA_PER_CRAFT)
    expect(countItem(fullResult.state.bag, recipe.output.item)).toBe(recipe.output.count)
    for (const input of recipe.inputs) expect(countItem(fullResult.state.bag, input.item)).toBe(countItem(blocked.bag, input.item) - input.count)
  }
  expect(blocked).toEqual(before)

  // Supplying exactly the first material releases at least the one slot needed
  // by this batch. Build the layout through normal stack limits, including tools.
  const exactInputs = bagWith(...recipe.inputs.map((input, index): [ItemId, number] => [input.item, input.count + (index === 0 ? 0 : 1)]))
  const freed = {
    ...blocked,
    bag: exactInputs.map((stack) => stack ?? { ...filler }),
  }
  const freedBefore = structuredClone(freed)
  const made = apply(freed, command)
  if (!made.ok) throw new Error(`${recipe.id}: freed slot rejected with ${made.reason}`)
  expect(made.events[0].type).toBe("crafted")
  expect(made.state.gold).toBe(freed.gold - station.fee)
  expect(made.state.stamina).toBe(freed.stamina - STAMINA_PER_CRAFT)
  expect(countItem(made.state.bag, recipe.output.item)).toBe(recipe.output.count)
  for (const input of recipe.inputs) expect(countItem(made.state.bag, input.item)).toBe(countItem(freed.bag, input.item) - input.count)
  expect(freed).toEqual(freedBefore)
  const product = made.state.bag.find((stack) => stack?.item === recipe.output.item)!

  if (recipe.output.count < limit) {
    const slot = blocked.bag.findIndex((stack) => stack?.item === fillerId)
    expect(slot).toBeGreaterThanOrEqual(0)
    const existing: Stack = { ...product, count: limit - recipe.output.count }
    const packed = { ...blocked, bag: blocked.bag.map((stack, index) => (index === slot ? existing : stack)) }
    const packedBefore = structuredClone(packed)
    const topped = apply(packed, command)
    if (!topped.ok) throw new Error(`${recipe.id}: matching stack rejected with ${topped.reason}`)
    expect(topped.events[0].type).toBe("crafted")
    expect(topped.state.bag[slot]).toEqual({ ...existing, count: limit })
    expect(countItem(topped.state.bag, recipe.output.item)).toBe(limit)
    expect(packed).toEqual(packedBefore)
    if (product.by !== undefined) {
      const otherMaker = { ...packed, bag: packed.bag.map((stack, index) => (index === slot ? { ...existing, by: "ウルリケ" } : stack)) }
      const otherBefore = structuredClone(otherMaker)
      const separate = apply(otherMaker, command)
      if (releasedSlots === 0) expect(separate).toEqual({ ok: false, reason: "BAG_FULL" })
      else {
        if (!separate.ok) throw new Error(`${recipe.id}: separate output slot rejected with ${separate.reason}`)
        expect(separate.events[0].type).toBe("crafted")
        expect(separate.state.bag[slot]).toEqual(otherMaker.bag[slot])
        expect(countItem(separate.state.bag, recipe.output.item)).toBe(limit)
      }
      expect(otherMaker).toEqual(otherBefore)
    }
  }

  // Spoiling is an accepted, paid outcome, distinct from a capacity refusal.
  const spoiled = apply(blocked, { ...command, roll: 0 })
  if (!spoiled.ok) throw new Error(`${recipe.id}: spoil rejected with ${spoiled.reason}`)
  expect(spoiled.events[0].type).toBe("spoiled")
  expect(spoiled.state.gold).toBe(blocked.gold - station.fee)
  expect(spoiled.state.stamina).toBe(blocked.stamina - STAMINA_PER_CRAFT)
  expect(countItem(spoiled.state.bag, recipe.output.item)).toBe(0)
  for (const input of recipe.inputs) expect(countItem(spoiled.state.bag, input.item)).toBe(countItem(blocked.bag, input.item) - input.count)
  expect(blocked).toEqual(before)

  const delta = ITEMS[recipe.output.item].weight * recipe.output.count - recipe.inputs.reduce((sum, input) => sum + ITEMS[input.item].weight * input.count, 0)
  const weightBase = {
    ...state,
    stats: { ...state.stats, str: 1 },
    bag: bagWith(...recipe.inputs.map((input): [ItemId, number] => [input.item, input.count])),
  }
  // Weight-one ballast places the real bag exactly at the carrying limit (or
  // one above for weight-neutral/reducing crafts, which remain permitted).
  const ballastId = (Object.keys(ITEMS) as ItemId[]).find((id) => ITEMS[id].weight === 1 && ITEMS[id].stack === 99 && id !== recipe.output.item && !recipe.inputs.some((input) => input.item === id))
  expect(ballastId).toBeDefined()
  const target = derive(weightBase).maxWeight + (delta > 0 ? 0 : 1)
  const loadBag = addItem({ bag: weightBase.bag, item: ballastId!, count: target - carried(weightBase) })
  expect(loadBag).not.toBeNull()
  const loaded = { ...weightBase, bag: loadBag! }
  expect(carried(loaded)).toBe(target)
  const loadedBefore = structuredClone(loaded)
  expect(parsePlayer(JSON.parse(JSON.stringify(loadedBefore)))).toEqual(loadedBefore)
  const weighted = apply(loaded, command)
  if (delta > 0) expect(weighted).toEqual({ ok: false, reason: "TOO_HEAVY" })
  else {
    if (!weighted.ok) throw new Error(`${recipe.id}: non-increasing load rejected with ${weighted.reason}`)
    expect(weighted.events[0].type).toBe("crafted")
    expect(carried(weighted.state)).toBe(target + delta)
    expect(weighted.state.gold).toBe(loaded.gold - station.fee)
    expect(weighted.state.stamina).toBe(loaded.stamina - STAMINA_PER_CRAFT)
  }
  expect(loaded).toEqual(loadedBefore)
})
