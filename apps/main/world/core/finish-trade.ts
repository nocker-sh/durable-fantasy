import type { PlayerState } from "#/world/core/player-types"
import type { TradeRecord, FinishedTrade, TradeFailure } from "#/world/core/trade-transaction-types"

type Props = { player: PlayerState; record: TradeRecord | null; id: string; revision: number; decision: "committed" | "aborted" }

/** 決定の再試行は無害にし、反対の決定や古い版で品を動かさない。 */
export function finishTrade(props: Props): FinishedTrade | TradeFailure {
  const record = props.record
  if (!record || record.proposal.id !== props.id || record.proposal.revision !== props.revision) return { ok: false, reason: "NOT_READY" }
  if (record.status !== "prepared") {
    if (record.status !== props.decision) return { ok: false, reason: "NOT_READY" }
    return { ok: true, player: props.player, record }
  }
  if (props.decision === "aborted") return { ok: true, player: props.player, record: { ...record, status: props.decision } }

  return { ok: true, player: { ...props.player, ...record.inventory }, record: { ...record, status: props.decision } }
}
