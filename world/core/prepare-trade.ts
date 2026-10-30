import { apply } from "#/world/core/apply"
import { sameProposal } from "#/world/core/same-proposal"
import { sameStacks } from "#/world/core/same-stacks"
import { takenOf } from "#/world/core/taken-of"
import type { PlayerState } from "#/world/core/player-types"
import type { TradeProposal, TradeRecord, PreparedTrade, TradeFailure } from "#/world/core/trade-transaction-types"

type Props = { player: PlayerState; previous: TradeRecord | null; proposal: TradeProposal; now: number }

/** 保留中は呼出し側で持ち物の変更を断り、確定前には元の状態を変えない。 */
export function prepareTrade(props: Props): PreparedTrade | TradeFailure {
  const proposal = props.proposal
  const previous = props.previous
  if (previous && proposal.revision === previous.proposal.revision) {
    if (!sameProposal(proposal, previous.proposal)) return { ok: false, reason: "NOT_READY" }
    return { ok: true, record: previous }
  }
  if (previous?.status === "prepared" || !Number.isSafeInteger(proposal.revision) || proposal.revision !== (previous?.proposal.revision ?? 0) + 1 || !proposal.id) {
    return { ok: false, reason: "NOT_READY" }
  }
  if (!Number.isSafeInteger(proposal.gold) || proposal.gold < 0) return { ok: false, reason: "NO_GOLD" }

  const outgoing = apply(props.player, { type: "trade-out", offer: proposal.offer }, { now: props.now })
  if (!outgoing.ok) return outgoing
  if (!sameStacks(takenOf(outgoing.events), proposal.outgoing)) return { ok: false, reason: "NOT_READY" }
  const incoming = apply(outgoing.state, { type: "trade-in", stacks: proposal.incoming, gold: proposal.gold }, { now: props.now })
  if (!incoming.ok) return incoming

  return { ok: true, record: { proposal: structuredClone(proposal), status: "prepared", inventory: { bag: incoming.state.bag, gold: incoming.state.gold } } }
}
