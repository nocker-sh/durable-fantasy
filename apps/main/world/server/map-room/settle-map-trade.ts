import { prepareTradeSettlement } from "#/world/server/map-room/prepare-trade-settlement"
import { advanceTradeSettlement } from "#/world/server/map-room/advance-trade-settlement"
import { publishSettledTrade } from "#/world/server/map-room/publish-settled-trade"
import { closeSettledTrade } from "#/world/server/map-room/close-settled-trade"
import type { TradeSettlementContext } from "#/world/server/map-room/trade-settlement-types"

/** 予約後に応答が失われても逆送付を作らず、保存済みの処理とアラームに回復を任せる。 */
export async function settleMapTrade(context: TradeSettlementContext): Promise<void> {
  const progress = { mayBePending: false }
  const finish = (reason: string | null) => closeSettledTrade({ room: context.room, peer: context.peer, mine: context.mine, other: context.other, reason })
  try {
    const prepared = await prepareTradeSettlement(context)
    if (!prepared.ok) return finish(prepared.reason)
    progress.mayBePending = true
    const reason = await advanceTradeSettlement({ context, local: prepared.local, remote: prepared.remote })
    if (reason) return finish(reason)
    await publishSettledTrade({ sender: context.room.ctx.connection, recipient: context.peer, playerA: context.playerA, playerB: context.playerB })
    return finish(null)
  } catch {
    return finish(progress.mayBePending ? "PENDING" : "NOT_READY")
  }
}
