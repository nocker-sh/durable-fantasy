// Skill transitions (game-system.md §9.3), after shared recovery and fallen-state guards.
import { removeItem } from "./bag.ts"
import type { Reason } from "./commands.ts"
import { lifeLevel } from "./life.ts"
import type { PlayerState } from "./player.ts"
import { artBlocked, firstAid, skillOf, type SkillId } from "./skills.ts"
import { derive } from "./stats.ts"
import { accept, reject, type Transition } from "./transition.ts"

function unavailable(state: PlayerState, skill: SkillId, now: number): Reason | null {
  const blocked = artBlocked(skill, state)
  if (blocked) return blocked
  if ((state.ready[skill] ?? 0) > now) return "COOLDOWN"
  if (state.sp < skillOf(skill).sp) return "SP_SHORT"
  return null
}

/** First aid consumes a herb; prayers heal through the equipped staff. */
export function cast(state: PlayerState, skill: SkillId, now: number): Transition {
  const definition = skillOf(skill)
  if (skill !== "first-aid" && definition.kind !== "prayer") return reject("NOT_USABLE")
  const blocked = unavailable(state, skill, now)
  if (blocked) return reject(blocked)
  const derived = derive(state)
  if (state.hp >= derived.maxHp) return reject("HP_FULL")
  let bag = state.bag
  let gain: number
  if (definition.kind === "prayer") {
    const heal = definition.heal
    gain = Math.floor(heal.base + heal.per * derived.stats[heal.stat])
  } else {
    const next = removeItem(bag, "herb", 1)
    if (!next) return reject("NO_HERB")
    bag = next
    gain = firstAid(lifeLevel(state.life.alchemy), derived.stats.vit)
  }
  const hp = Math.min(derived.maxHp, state.hp + gain)
  return accept({ ...state, bag, hp, sp: state.sp - definition.sp, ready: { ...state.ready, [skill]: now + definition.cooldown } }, { type: "cast", skill, hp: hp - state.hp })
}

/** The map room checks the target and range before paying for an offensive art. */
export function payArt(state: PlayerState, skill: SkillId, now: number): Transition {
  const definition = skillOf(skill)
  if (definition.kind !== "strike" && definition.kind !== "spell") return reject("NOT_USABLE")
  const blocked = unavailable(state, skill, now)
  if (blocked) return reject(blocked)
  return accept({ ...state, sp: state.sp - definition.sp, sitting: false, ready: { ...state.ready, [skill]: now + definition.cooldown } }, { type: "art", skill })
}
