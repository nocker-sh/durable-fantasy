import { checkTrade } from "#/world/core/check-trade"
import { getTradeProposals } from "#/world/server/map-room/get-trade-proposals"
import type { TradeFailure, TradeProposal } from "#/world/core/trade-transaction-types"
import type { TradeSettlementContext } from "#/world/server/map-room/trade-settlement-types"

type Prepared = TradeFailure | { ok: true; local: TradeProposal; remote: TradeProposal }

/** 双方の保存状態を並行して読み、既存の予約や成立しない提示を新しい予約より先に断る。 */
export async function prepareTradeSettlement(context: Pick<TradeSettlementContext, "playerA" | "playerB" | "mine" | "other">): Promise<Prepared> {
  const states = await Promise.all([context.playerA.read(), context.playerB.read(), context.playerA.tradeStatus(), context.playerB.tradeStatus()])
  if (states[2]?.status === "prepared" || states[3]?.status === "prepared") return { ok: false, reason: "NOT_READY" }
  const other = context.other.trade
  if (!other) throw Error("Trade disappeared before settlement")
  const reason = checkTrade({ playerA: states[0], offerA: context.mine.offer, playerB: states[1], offerB: other.offer, now: Date.now() })
  if (reason) return { ok: false, reason }
  const proposals = getTradeProposals({ id: crypto.randomUUID(), mine: context.mine, other, recordA: states[2], recordB: states[3] })

  return { ok: true, ...proposals }
}
