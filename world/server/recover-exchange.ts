import { finishInbox } from "#/world/core/finish-inbox"
import type { ExchangeContext, ExchangePlayers } from "#/world/server/exchange-coordinator"
import { RECOVERY_BATCH, RETRY_MS } from "#/world/server/exchange-coordinator"
import { advanceExchangeOrder } from "#/world/server/advance-exchange-order"

export async function recoverExchange(context: ExchangeContext, players: ExchangePlayers): Promise<void> {
  const pending = Object.entries(context.state.delivery.claims).slice(0, RECOVERY_BATCH)
  const orders = Object.entries(context.state.requests.jobs)
    .filter((entry) => entry[1].phase === "pending")
    .slice(0, RECOVERY_BATCH)
  if (!pending.length && !orders.length) return
  await context.setAlarm(Date.now() + RETRY_MS)
  for (const entry of orders) {
    const owner = entry[0]
    const job = entry[1]
    try {
      await advanceExchangeOrder({ context: context, players: players, owner: owner, id: job.id })
    } catch {
      delete context.state.requests.jobs[owner]
      context.state.requests.jobs[owner] = job
    }
  }
  for (const entry of pending) {
    const owner = entry[0]
    const claim = entry[1]
    try {
      const result = await players(owner).receiveInbox(claim)
      Object.assign(context.state, finishInbox({ ex: context.state.ex, delivery: context.state.delivery, owner: owner, id: claim.id, accepted: result.ok }))
    } catch {
      // Keep unknown outcomes durable; move failures behind other recipients for the next batch.
      delete context.state.delivery.claims[owner]
      context.state.delivery.claims[owner] = claim
    }
  }
}
