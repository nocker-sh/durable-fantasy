import { artBlocked } from "#/world/core/art-blocked"
import { skillOf } from "#/world/core/skill-of"
import type { Reason } from "#/world/core/commands"
import type { PlayerState } from "#/world/core/player-types"
import type { SkillId } from "#/world/core/skill-types"

/** Held equipment and requirements precede the cooldown and SP checks for both healing and attacks. */
export function getSkillUnavailableReason(state: PlayerState, skill: SkillId, now: number): Reason | null {
  const blocked = artBlocked(skill, state)
  if (blocked) return blocked
  if ((state.ready[skill] ?? 0) > now) return "COOLDOWN"
  if (state.sp < skillOf(skill).sp) return "SP_SHORT"

  return null
}
