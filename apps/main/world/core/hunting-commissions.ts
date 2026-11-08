import { HUNTING_RECIPES } from "#/world/core/recipes/hunting-recipes"
import type { Commission } from "#/world/core/commission-types"

export const HUNTING_COMMISSIONS: readonly Commission[] = HUNTING_RECIPES.map((recipe) => ({
  id: "hunting-" + recipe.id,
  craftsman: recipe.skill === "smithing" ? "アルノルト" : recipe.skill === "carpentry" ? "ゴットフリート" : "イルムガルト",
  output: recipe.output,
  inputs: recipe.inputs,
  fee: recipe.output.item === "forest-draught" ? 15 : recipe.output.item === "tempered-sword" || recipe.output.item === "root-staff" ? 120 : 60,
  minutes: recipe.output.item === "forest-draught" ? 1 : 3,
}))
