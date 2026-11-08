import { advanceTrade } from "#/world/server/advance-trade"
import { restoreSavedPlayer } from "#/world/server/restore-saved-player"
import { publishPlayer } from "#/world/server/publish-player"
import type { TradePeer } from "#/world/server/trade-coordinator"
import type { PlayerTradeContext } from "#/world/server/player-operation-types"

export async function advancePlayerTrade(context: PlayerTradeContext, peer: (id: string) => TradePeer, now: number): Promise<void> {
  const job = context.state.tradeJob
  if (!job || job.finished) return
  context.state.player = restoreSavedPlayer(context.state.player)
  // Arm recovery before crossing RPC; a failed state save must leave this retry scheduled.
  await context.setAlarm(now + 5000)
  const before = context.state.player
  await advanceTrade(context.state, peer(job.peer))
  if (context.state.player !== before) publishPlayer(context.state, restoreSavedPlayer(context.state.player))
}
