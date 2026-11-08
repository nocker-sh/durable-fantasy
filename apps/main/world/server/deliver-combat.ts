import type { WildContext, StrikePlayer, CombatNotice } from "#/world/server/wild-coordinator"
import { RETRY_MS, BATCH } from "#/world/server/wild-coordinator"
import { nextDeliveryRetry } from "#/world/server/next-delivery-retry"

export async function deliverCombat(context: WildContext, players: (owner: string) => StrikePlayer, owners: string[]): Promise<CombatNotice[]> {
  if (!owners.length) return []
  await context.setAlarm(Date.now() + RETRY_MS)
  const notices: CombatNotice[] = []
  // One effect per recipient per save. A rollback must never revisit an older ID than its last receipt.
  const budget = { left: BATCH }
  for (const owner of new Set(owners)) {
    const queue = context.state.deliveries[owner]
    if (!queue) continue
    const tried = { delivered: false, refused: false }
    try {
      if (queue.length && budget.left > 0) {
        budget.left--
        const result = await players(owner).receiveCombat(context.id.toString(), queue[0])
        if (result.ok) {
          queue.shift()
          notices.push({ owner, result })
          tried.delivered = true
        } else tried.refused = true
      }
    } catch {
      // The player may have saved the effect. Retain its ID and retry before later effects.
      tried.refused = true
    }
    // a recipient who keeps refusing (fallen, a trade on hold) is tried less and less often
    const retry = (context.state.deliveryRetry ??= {})
    if (tried.delivered || !queue.length) delete retry[owner]
    else if (tried.refused) retry[owner] = nextDeliveryRetry(retry[owner], Date.now())
    if (!Object.keys(retry).length) delete context.state.deliveryRetry
    delete context.state.deliveries[owner]
    if (queue.length) context.state.deliveries[owner] = queue
    if (!budget.left) break
  }
  return notices
}
