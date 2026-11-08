import type { WildContext, StrikePlayer, CombatParties } from "#/world/server/wild-coordinator"
import { RETRY_MS, BATCH } from "#/world/server/wild-coordinator"
import { advanceStrike } from "#/world/server/advance-strike"
import { deliverCombat } from "#/world/server/deliver-combat"

export async function recoverStrikes(context: WildContext, players: (owner: string) => StrikePlayer, parties: CombatParties): Promise<void> {
  const jobs = Object.entries(context.state.jobs)
    .filter((entry) => entry[1].phase === "pending")
    .slice(0, BATCH)
  const now = Date.now()
  const retry = context.state.deliveryRetry ?? {}
  const owed = Object.keys(context.state.deliveries)
  const recipients = owed.filter((owner) => (retry[owner]?.at ?? 0) <= now).slice(0, BATCH)
  if (!jobs.length && !recipients.length) {
    // nobody is due: sleep until the first refused recipient is to be tried again
    if (owed.length) await context.setAlarm(Math.min(...owed.map((owner) => retry[owner]?.at ?? now + RETRY_MS)))
    return
  }
  await context.setAlarm(now + RETRY_MS)
  // Only deliver previously saved effects. Hits finished below wait for the next saved operation.
  await deliverCombat(context, players, recipients)
  for (const entry of jobs) {
    const owner = entry[0]
    const job = entry[1]
    try {
      await advanceStrike({ context: context, players: players, parties: parties, owner: owner, id: job.id })
    } catch {
      delete context.state.jobs[owner]
      context.state.jobs[owner] = job
    }
  }
}
