import { RECIPES } from "#/world/core/recipes/catalog"

const recipesById = new Map(RECIPES.map((recipe) => [recipe.id, recipe]))

/** 定義順を保った共通の索引からレシピを引く。 */
export function recipeOf(id: string) {
  return recipesById.get(id)
}
