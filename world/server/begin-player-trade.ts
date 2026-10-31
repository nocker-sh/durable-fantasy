import { beginTrade } from "#/world/server/begin-trade"
import { restoreSavedPlayer } from "#/world/server/restore-saved-player"
import type { PlayerTradeContext, PlayerTradeInput } from "#/world/server/player-operation-types"

export async function beginPlayerTrade(context: PlayerTradeContext, input: PlayerTradeInput, now: number): Promise<ReturnType<typeof beginTrade>> {
  context.state.player = restoreSavedPlayer(context.state.player)
  const result = beginTrade({ state: context.state, peer: input.peer, local: input.local, remote: input.remote, now })
  if (result.ok && !result.job.finished) await context.setAlarm(now + 100)
  return result
}
