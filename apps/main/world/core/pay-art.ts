import { skillOf } from "#/world/core/skill-of"
import { getSkillUnavailableReason } from "#/world/core/get-skill-unavailable-reason"
import { accept } from "#/world/core/accept"
import { reject } from "#/world/core/reject"
import type { PlayerState } from "#/world/core/player-types"
import type { SkillId } from "#/world/core/skill-types"
import type { Transition } from "#/world/core/transition"

/** The map room checks the target and range before paying for an offensive art. */
export function payArt(state: PlayerState, skill: SkillId, now: number): Transition {
  const definition = skillOf(skill)
  if (definition.kind !== "strike" && definition.kind !== "spell") return reject("NOT_USABLE")
  const blocked = getSkillUnavailableReason(state, skill, now)
  if (blocked) return reject(blocked)

  return accept({ ...state, sp: state.sp - definition.sp, sitting: false, ready: { ...state.ready, [skill]: now + definition.cooldown } }, { type: "art", skill })
}
