// Manufacturing rules (economy.md §2). The dispatcher settles recovery and rejects fallen
// players before calling this pure transition; a rejected craft never consumes inputs.
import { addItem } from "#/world/core/add-item"
import { fitsEveryOutcome } from "#/world/core/fits-every-outcome"
import type { Quality } from "#/world/core/items/kinds"
import { overWeight } from "#/world/core/over-weight"
import { prepareCraft } from "#/world/core/prepare-craft"
import type { ServerCommand } from "#/world/core/commands"
import { STAMINA_PER_CRAFT } from "#/world/core/crafting-rules"
import { craftedQuality } from "#/world/core/crafted-quality"
import { failChance } from "#/world/core/fail-chance"
import { ITEMS } from "#/world/core/items/catalog"
import { craftExp } from "#/world/core/craft-exp"
import { gainLife } from "#/world/core/gain-life"
import type { PlayerState } from "#/world/core/player-types"
import { accept } from "#/world/core/accept"
import { reject } from "#/world/core/reject"
import type { Transition } from "#/world/core/transition"

export function craft(state: PlayerState, command: Extract<ServerCommand, { type: "craft" }>): Transition {
  const prepared = prepareCraft(state, command)
  if (!prepared.ok) return prepared
  const recipe = prepared.recipe,
    station = prepared.station,
    skill = prepared.skill,
    materials = prepared.materials
  const cost = STAMINA_PER_CRAFT
  const out = recipe.output
  // room for whichever quality comes out, before the roll: a full bag must not refuse only the unwanted results
  const qualities: readonly (Quality | null)[] = ITEMS[out.item].made ? [0, 1, 2, 3] : [null]
  const full = fitsEveryOutcome({ state, bag: materials.bag, outcomes: qualities.map((q) => ({ item: out.item, count: out.count, mark: q !== null ? { q, by: state.name } : undefined })) })
  if (full) return reject(full)

  // a hand new to the recipe spoils it now and then: the materials and fee are gone, but half the experience comes
  if ((command.roll * 15485863) % 1 < failChance(skill, recipe.min)) {
    const grown = gainLife(state.life, recipe.skill, Math.floor(craftExp(recipe.min) / 2))
    return accept(
      { ...state, bag: materials.bag, gold: state.gold - station.fee, stamina: state.stamina - cost, life: grown.life, sitting: false },
      { type: "spoiled", recipe: recipe.id, skill: recipe.skill, level: grown.level, up: grown.up, fee: station.fee },
    )
  }
  const q = ITEMS[out.item].made ? craftedQuality(skill, materials.made ? materials.weight / materials.made : 1, command.roll) : null
  const added = addItem({ bag: materials.bag, item: out.item, count: out.count, mark: q !== null ? { q, by: state.name } : undefined })
  if (!added) return reject("BAG_FULL")
  if (overWeight(state, { ...state, bag: added })) return reject("TOO_HEAVY")
  const grown = gainLife(state.life, recipe.skill, craftExp(recipe.min))
  return accept(
    { ...state, bag: added, gold: state.gold - station.fee, stamina: state.stamina - cost, life: grown.life, sitting: false },
    { type: "crafted", item: out.item, count: out.count, q, skill: recipe.skill, level: grown.level, up: grown.up, fee: station.fee },
  )
}
