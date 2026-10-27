// Making things (economy.md §2): recipes at the town's shared stations — the hearth, workbench and
// loom in the craftsmen's workshop, the shared forge in its yard. A thing worth having needs more
// than one trade: an axe takes the smith's iron and the woodworker's plank. Using a station costs a
// small fee (money leaves the economy), a go costs stamina, and the quality of what comes out
// follows your proficiency and what you put in. Pure: the server rolls the dice.
import { QUALITY_EFFECT, type Quality } from "./items.ts"
import { lifeLift } from "./life.ts"

import type { StationKind, Recipe } from "./recipes/definition.ts"
export type { StationKind, Recipe } from "./recipes/definition.ts"
import { COOKING_RECIPES } from "./recipes/cooking.ts"
import { ALCHEMY_RECIPES } from "./recipes/alchemy.ts"
import { CARPENTRY_RECIPES } from "./recipes/carpentry.ts"
import { TAILORING_RECIPES } from "./recipes/tailoring.ts"
import { SMITHING_RECIPES } from "./recipes/smithing.ts"
import { MILESTONES_RECIPES } from "./recipes/milestones.ts"

export interface Station {
  id: string
  kind: StationKind
  name: string
  map: string
  cell: readonly [number, number]
  /** what a go costs, paid to the town's 寄り合い */
  fee: number
}

export type StationRule = Omit<Station, "map" | "cell">

/** The stations and what a go at each costs. Where each stands is the town's (town/stations.ts). */
export const STATION_RULES: readonly StationRule[] = [
  { id: "workshop-hearth", kind: "hearth", name: "共同のかまど", fee: 1 },
  { id: "workshop-bench", kind: "workbench", name: "共同の作業台", fee: 2 },
  { id: "workshop-loom", kind: "loom", name: "共同の機織り機と糸車", fee: 2 },
  { id: "craft-forge", kind: "forge", name: "共同の炉", fee: 4 },
]
export const stationOf = (id: string) => STATION_RULES.find((x) => x.id === id)

export const RECIPES: readonly Recipe[] = [...COOKING_RECIPES, ...ALCHEMY_RECIPES, ...CARPENTRY_RECIPES, ...TAILORING_RECIPES, ...SMITHING_RECIPES, ...MILESTONES_RECIPES]

const recipesById = new Map(RECIPES.map((recipe) => [recipe.id, recipe]))
export const recipeOf = (id: string) => recipesById.get(id)

/** A hand new to a recipe spoils some of what it tries (the materials are lost): three in ten at its level, one fewer a level. */
export const failChance = (level: number, min: number) => Math.max(0, 0.3 - (level - min) * 0.1)
export const STAMINA_PER_CRAFT = 1

/**
 * The quality of what comes out: the roll against chances that rise with the skill's level and
 * with the quality of what went in (an average of the made inputs, 1 when none were made).
 */
export function craftedQuality(level: number, inputQuality: number, roll: number): Quality {
  const lift = lifeLift(level) + (inputQuality - 1) * 0.15
  const pTop = Math.max(0, lift - 0.55) * 0.5 // 極
  const pHigh = Math.min(0.5, Math.max(0, lift * 0.45)) // 上
  const pLow = Math.max(0.05, 0.45 - lift * 0.6) // 並
  if (roll < pTop) return 3
  if (roll < pTop + pHigh) return 2
  if (roll > 1 - pLow) return 0
  return 1
}

/** How much a made input counts towards quality. */
export const qualityWeight = (q: Quality | undefined) => (q === undefined ? 1 : QUALITY_EFFECT[q] >= 1.2 ? (q === 3 ? 3 : 2) : q === 0 ? 0 : 1)
