import { removeItem } from "#/world/core/remove-item"
import { firstAid } from "#/world/core/first-aid"
import { lifeLevel } from "#/world/core/life-level"
import type { PlayerState } from "#/world/core/player-types"
import type { SkillDef } from "#/world/core/skill-types"
import type { Derived } from "#/world/core/stats-types"

type Recovery = { bag: PlayerState["bag"]; gain: number }

/** Called after cast-kind and full-HP checks; prayers keep the bag while first aid reserves one herb. */
export function getCastRecovery(state: PlayerState, definition: SkillDef, derived: Derived): Recovery | Error {
  if (definition.kind === "prayer") {
    const heal = definition.heal
    return { bag: state.bag, gain: Math.floor(heal.base + heal.per * derived.stats[heal.stat]) }
  }

  const bag = removeItem({ bag: state.bag, item: "herb", count: 1 })
  if (!bag) return new Error("NO_HERB")

  return { bag, gain: firstAid(lifeLevel(state.life.alchemy), derived.stats.vit) }
}
