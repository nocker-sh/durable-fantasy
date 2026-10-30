import { skillOf } from "#/world/core/skill-of"
import { getSkillUnavailableReason } from "#/world/core/get-skill-unavailable-reason"
import { getCastRecovery } from "#/world/core/get-cast-recovery"
import { derive } from "#/world/core/derive"
import { accept } from "#/world/core/accept"
import { reject } from "#/world/core/reject"
import type { PlayerState } from "#/world/core/player-types"
import type { SkillId } from "#/world/core/skill-types"
import type { Transition } from "#/world/core/transition"

/** First aid and prayers share refusal ordering, then commit recovery, consumption and cooldown together. */
export function cast(state: PlayerState, skill: SkillId, now: number): Transition {
  const definition = skillOf(skill)
  if (skill !== "first-aid" && definition.kind !== "prayer") return reject("NOT_USABLE")
  const blocked = getSkillUnavailableReason(state, skill, now)
  if (blocked) return reject(blocked)
  const derived = derive(state)
  if (state.hp >= derived.maxHp) return reject("HP_FULL")

  const recovery = getCastRecovery(state, definition, derived)
  if (recovery instanceof Error) return reject("NO_HERB")
  const hp = Math.min(derived.maxHp, state.hp + recovery.gain)

  return accept({ ...state, bag: recovery.bag, hp, sp: state.sp - definition.sp, ready: { ...state.ready, [skill]: now + definition.cooldown } }, { type: "cast", skill, hp: hp - state.hp })
}
