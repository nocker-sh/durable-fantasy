import { apply } from "#/world/core/apply"
import { FIGHT_STAMINA } from "#/world/core/monsters"
import type { PlayerState } from "#/world/core/player-types"
import type { SkillId } from "#/world/core/skill-types"
import type { Transition } from "#/world/core/transition"

type Props = { player: PlayerState; isReserved: boolean; art?: SkillId; expectedLife?: number; currentLife: number; now: number }

/** A saved strike must still belong to this life before spending stamina or skill points. */
export function getStrikePayment(props: Props): Transition {
  if (props.isReserved || (props.expectedLife !== undefined && props.expectedLife !== props.currentLife)) return { ok: false, reason: "NOT_READY" }
  if (props.player.hp <= 0) return { ok: false, reason: "FALLEN" }
  if (props.player.stamina < FIGHT_STAMINA) return { ok: false, reason: "EXHAUSTED" }
  if (props.art) return apply(props.player, { type: "art", skill: props.art }, { now: props.now })

  return { ok: true, state: props.player, events: [] }
}
