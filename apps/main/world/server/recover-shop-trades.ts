import type { MarketContext, ShopPlayers } from "#/world/server/market-coordinator"
import { RETRY_MS, BATCH } from "#/world/server/market-coordinator"
import { finishShopTrade } from "#/world/server/finish-shop-trade"

export async function recoverShopTrades(context: MarketContext, players: ShopPlayers): Promise<void> {
  const jobs = Object.entries(context.state.jobs)
    .filter((entry) => entry[1].phase === "pending")
    .slice(0, BATCH)
  if (!jobs.length) return
  await context.setAlarm(Date.now() + RETRY_MS)
  for (const entry of jobs) {
    const owner = entry[0]
    const job = entry[1]
    try {
      await finishShopTrade({ context: context, players: players, owner: owner, id: job.id })
    } catch {
      delete context.state.jobs[owner]
      context.state.jobs[owner] = job
    }
  }
}
