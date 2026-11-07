import type { Reason, ServerCommand } from "#/world/core/commands"
import type { StationRule } from "#/world/core/crafting-types"
import type { PlayerState } from "#/world/core/player-types"
import type { Recipe } from "#/world/core/recipes/definition"
import { STAMINA_PER_CRAFT } from "#/world/core/crafting-rules"
import { lifeLevel } from "#/world/core/life-level"
import { recipeOf } from "#/world/core/recipe-of"
import { stationOf } from "#/world/core/station-of"
import { takeCraftInputs } from "#/world/core/take-craft-inputs"

type Props = Readonly<Pick<Extract<ServerCommand, { type: "craft" }>, "recipe" | "station">>
type Result = Readonly<
  { ok: false; reason: Reason } | { ok: true; recipe: Readonly<Recipe>; station: Readonly<StationRule>; skill: number; materials: Readonly<NonNullable<ReturnType<typeof takeCraftInputs>>> }
>

/** Share preparation with the UI without rolling, paying or changing the player's bag. */
export function prepareCraft(state: PlayerState, props: Props): Result {
  const recipe = recipeOf(props.recipe),
    station = stationOf(props.station)
  if (!recipe || !station || recipe.station !== station.kind) return { ok: false, reason: "WRONG_STATION" }
  const skill = lifeLevel(state.life[recipe.skill])
  if (skill < recipe.min) return { ok: false, reason: "NOT_SKILLED" }
  if (state.gold < station.fee) return { ok: false, reason: "NO_GOLD" }
  if (state.stamina < STAMINA_PER_CRAFT) return { ok: false, reason: "EXHAUSTED" }
  const materials = takeCraftInputs({ bag: state.bag, inputs: recipe.inputs })
  if (!materials) return { ok: false, reason: "MISSING_INPUTS" }
  return { ok: true, recipe, station, skill, materials }
}
