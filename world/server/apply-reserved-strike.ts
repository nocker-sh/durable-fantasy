import { hit } from "#/world/core/wild/hit"
import { hpOf } from "#/world/core/wild/hp-of"
import type { Transition } from "#/world/core/transition"
import type { StrikeJob, StrikeResult } from "#/world/server/wild-record"
import type { WildContext } from "#/world/server/wild-coordinator"
import { advanceWildRevision } from "#/world/server/advance-wild-revision"

type Props = {
  context: WildContext
  job: StrikeJob
  payment: Transition | undefined
  owner: string
}

/** Apply only the reserved target after payment; other targets may have changed while waiting. */
export function applyReservedStrike(props: Props): StrikeResult {
  if (props.payment && !props.payment.ok)
    return {
      hp: hpOf(props.context.state.wild, props.job.target, props.job.at),
      back: props.context.state.wild.back[props.job.target] ?? 0,
      beaten: false,
      refused: true,
      reason: props.payment.reason,
    }

  const applied = hit({ state: props.context.state.wild, id: props.job.target, damage: props.job.damage, now: props.job.at, player: props.owner })
  if (applied.refused) throw new Error("Reserved strike target changed")

  props.context.state.wild = applied.state
  return { revision: advanceWildRevision(props.context.state), hp: applied.hp, back: applied.state.back[props.job.target] ?? 0, beaten: applied.beaten, refused: false }
}
