import type { TradeProposal } from "#/world/core/trade-transaction-types"
import type { TradeSettlementContext } from "#/world/server/map-room/trade-settlement-types"

type Props = Readonly<{ context: Pick<TradeSettlementContext, "ownerA" | "ownerB" | "playerA" | "playerB">; local: TradeProposal; remote: TradeProposal }>

/** 所有者順で担当を決めて RPC の待合いを防ぐ。各 advance は独立した保存境界として呼ぶ。 */
export async function advanceTradeSettlement(props: Props): Promise<string | null> {
  const first = props.context.ownerA < props.context.ownerB
  const coordinator = first ? props.context.playerA : props.context.playerB
  const started = await coordinator.beginTrade({ peer: first ? props.context.ownerB : props.context.ownerA, local: first ? props.local : props.remote, remote: first ? props.remote : props.local })
  if (!started.ok) return started.reason
  await coordinator.advanceTrade()
  const job = await coordinator.advanceTrade()
  if (!job?.finished) return "PENDING"

  return job.reason || null
}
