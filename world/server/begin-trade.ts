import { prepareTrade } from "#/world/core/prepare-trade"
import { sameProposal } from "#/world/core/same-proposal"
import { sameStacks } from "#/world/core/same-stacks"
import type { TradeProposal } from "#/world/core/trade-transaction-types"
import type { Reason } from "#/world/core/commands"
import type { TradeJob, TradeParticipant } from "#/world/server/trade-coordinator"

type Props = {
  state: TradeParticipant
  peer: string
  local: TradeProposal
  remote: TradeProposal
  now: number
}

export function beginTrade(props: Props): { ok: true; job: TradeJob } | { ok: false; reason: Reason } {
  const previous = props.state.tradeJob
  if (previous?.local.id === props.local.id) {
    return previous.peer === props.peer && sameProposal(previous.local, props.local) && sameProposal(previous.remote, props.remote) ? { ok: true, job: previous } : { ok: false, reason: "NOT_READY" }
  }
  if (previous && !previous.finished) return { ok: false, reason: "NOT_READY" }
  if (
    !props.peer ||
    props.local.id !== props.remote.id ||
    props.local.gold !== props.remote.offer.gold ||
    props.remote.gold !== props.local.offer.gold ||
    !sameStacks(props.local.outgoing, props.remote.incoming) ||
    !sameStacks(props.remote.outgoing, props.local.incoming)
  ) {
    return { ok: false, reason: "NOT_READY" }
  }
  const prepared = prepareTrade({ player: props.state.player, previous: props.state.trade, proposal: props.local, now: props.now })
  if (!prepared.ok) return prepared
  if (prepared.record.status !== "prepared") return { ok: false, reason: "NOT_READY" }
  const job: TradeJob = { peer: props.peer, local: structuredClone(props.local), remote: structuredClone(props.remote), decision: null, finished: false, reason: null }
  props.state.trade = prepared.record
  props.state.tradeJob = job
  return { ok: true, job }
}
