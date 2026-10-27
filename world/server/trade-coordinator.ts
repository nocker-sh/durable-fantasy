// The initiating player's DO also keeps the durable decision. Each advance is one save boundary:
// prepare the peer, persist the decision, then deliver that decision and finish locally.
import { finishTrade, prepareTrade, sameProposal, sameStacks, type TradeProposal, type TradeRecord } from "../core/trade-transaction.ts"
import type { PlayerState } from "../core/player.ts"
import type { Transition } from "../core/transition.ts"
import type { Reason } from "../core/commands.ts"

export interface TradeJob {
  peer: string
  local: TradeProposal
  remote: TradeProposal
  decision: "committed" | "aborted" | null
  finished: boolean
  reason: Reason | null
}
export interface TradeParticipant {
  player: PlayerState
  trade: TradeRecord | null
  tradeJob: TradeJob | null
}
export interface TradePeer {
  prepareTrade(proposal: TradeProposal): Promise<ReturnType<typeof prepareTrade>>
  finishTrade(id: string, revision: number, decision: "committed" | "aborted"): Promise<Transition>
  tradeStatus(): Promise<TradeRecord | null>
}

export function beginTrade(state: TradeParticipant, peer: string, local: TradeProposal, remote: TradeProposal, now: number): { ok: true; job: TradeJob } | { ok: false; reason: Reason } {
  const previous = state.tradeJob
  if (previous?.local.id === local.id) {
    return previous.peer === peer && sameProposal(previous.local, local) && sameProposal(previous.remote, remote) ? { ok: true, job: previous } : { ok: false, reason: "NOT_READY" }
  }
  if (previous && !previous.finished) return { ok: false, reason: "NOT_READY" }
  if (
    !peer ||
    local.id !== remote.id ||
    local.gold !== remote.offer.gold ||
    remote.gold !== local.offer.gold ||
    !sameStacks(local.outgoing, remote.incoming) ||
    !sameStacks(remote.outgoing, local.incoming)
  ) {
    return { ok: false, reason: "NOT_READY" }
  }
  const prepared = prepareTrade(state.player, state.trade, local, now)
  if (!prepared.ok) return prepared
  if (prepared.record.status !== "prepared") return { ok: false, reason: "NOT_READY" }
  const job: TradeJob = { peer, local: structuredClone(local), remote: structuredClone(remote), decision: null, finished: false, reason: null }
  state.trade = prepared.record
  state.tradeJob = job
  return { ok: true, job }
}

/** Mutations must be persisted atomically by the caller, and failures retried from the prior state. */
export async function advanceTrade(state: TradeParticipant, peer: TradePeer): Promise<void> {
  const job = state.tradeJob
  if (!job || job.finished) return
  if (!job.decision) {
    const result = await peer.prepareTrade(job.remote)
    if (result.ok && result.record.status !== "prepared") throw new Error("Unexpected peer trade decision")
    state.tradeJob = { ...job, decision: result.ok ? "committed" : "aborted", reason: result.ok ? null : result.reason }
    return // The decision must reach durable storage before either side commits.
  }
  if (job.decision === "committed") {
    const result = await peer.finishTrade(job.remote.id, job.remote.revision, job.decision)
    if (!result.ok) {
      const later = await peer.tradeStatus()
      // A later revision can only start after this reservation was released. This coordinator is
      // the sole decision writer; advancing proves a lost commit reply already took effect.
      if (!later || later.proposal.revision <= job.remote.revision) throw new Error("Peer trade is not committed")
    }
  }
  // Aborts here follow an explicit prepare refusal: the peer never reserved this exchange.
  const local = finishTrade(state.player, state.trade, job.local.id, job.local.revision, job.decision)
  if (!local.ok) throw new Error("Local trade reservation is missing")
  state.player = local.player
  state.trade = local.record
  state.tradeJob = { ...job, finished: true }
}
