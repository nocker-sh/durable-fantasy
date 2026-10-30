import { finishTrade } from "#/world/core/finish-trade"
import type { TradeParticipant, TradePeer } from "#/world/server/trade-coordinator"

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
    const result = await peer.finishTrade({ id: job.remote.id, revision: job.remote.revision, decision: job.decision })
    if (!result.ok) {
      const later = await peer.tradeStatus()
      // A later revision can only start after this reservation was released. This coordinator is
      // the sole decision writer; advancing proves a lost commit reply already took effect.
      if (!later || later.proposal.revision <= job.remote.revision) throw new Error("Peer trade is not committed")
    }
  }
  // Aborts here follow an explicit prepare refusal: the peer never reserved this exchange.
  const local = finishTrade({ player: state.player, record: state.trade, id: job.local.id, revision: job.local.revision, decision: job.decision })
  if (!local.ok) throw new Error("Local trade reservation is missing")
  state.player = local.player
  state.trade = local.record
  state.tradeJob = { ...job, finished: true }
}
