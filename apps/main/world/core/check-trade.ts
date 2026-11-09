import { apply } from "#/world/core/apply"
import { takenOf } from "#/world/core/taken-of"
import { tradeIn } from "#/world/core/trade-in"
import type { Offer } from "#/world/core/trade-types"
import type { Reason } from "#/world/core/commands"
import type { PlayerState } from "#/world/core/player-types"

type Props = { playerA: PlayerState; offerA: Offer; playerB: PlayerState; offerB: Offer; now: number }

/** 双方が提示した品を渡し、相手の品を受け取れるかを元の状態を変えずに検証する。 */
export function checkTrade(props: Props): Reason | null {
  const outA = apply(props.playerA, { type: "trade-out", offer: props.offerA }, { now: props.now })
  if (!outA.ok) return outA.reason
  const outB = apply(props.playerB, { type: "trade-out", offer: props.offerB }, { now: props.now })
  if (!outB.ok) return outB.reason
  const inA = tradeIn(outA.state, { type: "trade-in", stacks: takenOf(outB.events), gold: props.offerB.gold }, props.playerA)
  if (!inA.ok) return inA.reason
  const inB = tradeIn(outB.state, { type: "trade-in", stacks: takenOf(outA.events), gold: props.offerA.gold }, props.playerB)
  if (!inB.ok) return inB.reason

  return null
}
