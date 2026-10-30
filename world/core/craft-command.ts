// Manufacturing rules (economy.md §2). The dispatcher settles recovery and rejects fallen
// players before calling this pure transition; a rejected craft never consumes inputs.
import { addItem } from "#/world/core/add-item"
import { takeCraftInputs } from "#/world/core/take-craft-inputs"
import type { ServerCommand } from "./commands"
import { STAMINA_PER_CRAFT } from "#/world/core/crafting-rules"
import { craftedQuality } from "#/world/core/crafted-quality"
import { failChance } from "#/world/core/fail-chance"
import { recipeOf } from "#/world/core/recipe-of"
import { stationOf } from "#/world/core/station-of"
import { ITEMS } from "#/world/core/items/catalog"
import { craftExp } from "#/world/core/craft-exp"
import { gainLife } from "#/world/core/gain-life"
import { lifeLevel } from "#/world/core/life-level"
import type { PlayerState } from "#/world/core/player-types"
import { accept } from "#/world/core/accept"
import { reject } from "#/world/core/reject"
import type { Transition } from "#/world/core/transition"

export function craft(state: PlayerState, command: Extract<ServerCommand, { type: "craft" }>): Transition {
  const recipe = recipeOf(command.recipe),
    station = stationOf(command.station)
  if (!recipe || !station || recipe.station !== station.kind) return reject("WRONG_STATION")
  const skill = lifeLevel(state.life[recipe.skill])
  if (skill < recipe.min) return reject("NOT_SKILLED")
  if (state.gold < station.fee) return reject("NO_GOLD")
  const cost = STAMINA_PER_CRAFT
  if (state.stamina < cost) return reject("EXHAUSTED")
  const materials = takeCraftInputs({ bag: state.bag, inputs: recipe.inputs })
  if (!materials) return reject("MISSING_INPUTS")

  // a hand new to the recipe spoils it now and then: the materials and fee are gone, but half the experience comes
  if ((command.roll * 15485863) % 1 < failChance(skill, recipe.min)) {
    const grown = gainLife(state.life, recipe.skill, Math.floor(craftExp(recipe.min) / 2))
    return accept(
      { ...state, bag: materials.bag, gold: state.gold - station.fee, stamina: state.stamina - cost, life: grown.life },
      { type: "spoiled", recipe: recipe.id, skill: recipe.skill, level: grown.level, up: grown.up, fee: station.fee },
    )
  }
  const out = recipe.output
  const q = ITEMS[out.item].made ? craftedQuality(skill, materials.made ? materials.weight / materials.made : 1, command.roll) : null
  const added = addItem({ bag: materials.bag, item: out.item, count: out.count, mark: q !== null ? { q, by: state.name } : undefined })
  if (!added) return reject("BAG_FULL")
  const grown = gainLife(state.life, recipe.skill, craftExp(recipe.min))
  return accept(
    { ...state, bag: added, gold: state.gold - station.fee, stamina: state.stamina - cost, life: grown.life },
    { type: "crafted", item: out.item, count: out.count, q, skill: recipe.skill, level: grown.level, up: grown.up, fee: station.fee },
  )
}
