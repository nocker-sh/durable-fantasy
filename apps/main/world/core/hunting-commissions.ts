import { ITEMS } from "#/world/core/items/catalog"
import { HUNTING_RECIPES } from "#/world/core/recipes/hunting-recipes"
import type { Commission } from "#/world/core/commission-types"

export const HUNTING_COMMISSIONS: readonly Commission[] = HUNTING_RECIPES.map((recipe) => ({
  id: "hunting-" + recipe.id,
  craftsman: recipe.skill === "smithing" ? "アルノルト" : recipe.skill === "carpentry" ? "ゴットフリート" : "イルムガルト",
  output: recipe.output,
  inputs: recipe.inputs,
  fee: recipe.output.item === "forest-draught" ? 15 : ITEMS[recipe.output.item].equip?.level === 22 ? 120 : 60,
  minutes: recipe.output.item === "forest-draught" ? 1 : 3,
}))
