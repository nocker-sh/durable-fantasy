import type { Recipe } from "#/world/core/recipes/definition"
import { COOKING_RECIPES } from "#/world/core/recipes/cooking"
import { ALCHEMY_RECIPES } from "#/world/core/recipes/alchemy"
import { CARPENTRY_RECIPES } from "#/world/core/recipes/carpentry"
import { TAILORING_RECIPES } from "#/world/core/recipes/tailoring"
import { SMITHING_RECIPES } from "#/world/core/recipes/smithing"
import { MILESTONES_RECIPES } from "#/world/core/recipes/milestones"

export const RECIPES: readonly Recipe[] = [...COOKING_RECIPES, ...ALCHEMY_RECIPES, ...CARPENTRY_RECIPES, ...TAILORING_RECIPES, ...SMITHING_RECIPES, ...MILESTONES_RECIPES]
