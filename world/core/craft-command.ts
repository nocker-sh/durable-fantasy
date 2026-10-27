// Manufacturing rules (economy.md §2). The dispatcher settles recovery and rejects fallen
// players before calling this pure transition; a rejected craft never consumes inputs.
import { addItem, takeFromSlot, type Bag } from "./bag.ts"
import type { ServerCommand } from "./commands.ts"
import { STAMINA_PER_CRAFT, craftedQuality, failChance, qualityWeight, recipeOf, stationOf } from "./crafting.ts"
import { ITEMS } from "./items.ts"
import { craftExp, gainLife, lifeLevel } from "./life.ts"
import type { PlayerState } from "./player.ts"
import { accept, reject, type Transition } from "./transition.ts"

export function craft(state: PlayerState, command: Extract<ServerCommand, { type: "craft" }>): Transition {
  const recipe = recipeOf(command.recipe),
    station = stationOf(command.station)
  if (!recipe || !station || recipe.station !== station.kind) return reject("WRONG_STATION")
  const skill = lifeLevel(state.life[recipe.skill])
  if (skill < recipe.min) return reject("NOT_SKILLED")
  if (state.gold < station.fee) return reject("NO_GOLD")
  const cost = STAMINA_PER_CRAFT
  if (state.stamina < cost) return reject("EXHAUSTED")
  // take the inputs, the lowest qualities first (keep the good ones for later)
  let bag: Bag = state.bag
  let weight = 0,
    made = 0
  for (const { item, count } of recipe.inputs) {
    for (let left = count; left > 0; left--) {
      let at = -1
      bag.forEach((s, i) => {
        if (s?.item === item && (at < 0 || (s.q ?? 1) < (bag[at]!.q ?? 1))) at = i
      })
      if (at < 0) return reject("MISSING_INPUTS")
      if (ITEMS[item].made) {
        weight += qualityWeight(bag[at]!.q)
        made++
      }
      bag = takeFromSlot(bag, at, 1)!
    }
  }
  // a hand new to the recipe spoils it now and then: the materials and fee are gone, but half the experience comes
  if ((command.roll * 15485863) % 1 < failChance(skill, recipe.min)) {
    const grown = gainLife(state.life, recipe.skill, Math.floor(craftExp(recipe.min) / 2))
    return accept(
      { ...state, bag, gold: state.gold - station.fee, stamina: state.stamina - cost, life: grown.life },
      { type: "spoiled", recipe: recipe.id, skill: recipe.skill, level: grown.level, up: grown.up, fee: station.fee },
    )
  }
  const out = recipe.output
  const q = ITEMS[out.item].made ? craftedQuality(skill, made ? weight / made : 1, command.roll) : null
  const added = addItem(bag, out.item, out.count, q !== null ? { q, by: state.name } : undefined)
  if (!added) return reject("BAG_FULL")
  const grown = gainLife(state.life, recipe.skill, craftExp(recipe.min))
  return accept(
    { ...state, bag: added, gold: state.gold - station.fee, stamina: state.stamina - cost, life: grown.life },
    { type: "crafted", item: out.item, count: out.count, q, skill: recipe.skill, level: grown.level, up: grown.up, fee: station.fee },
  )
}
