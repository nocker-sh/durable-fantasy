import type { WildContext, StrikePlayer, CombatParties } from "#/world/server/wild-coordinator"
import { RETRY_MS, BATCH } from "#/world/server/wild-coordinator"
import { advanceStrike } from "#/world/server/advance-strike"
import { deliverCombat } from "#/world/server/deliver-combat"

export async function recoverStrikes(context: WildContext, players: (owner: string) => StrikePlayer, parties: CombatParties): Promise<void> {
  const jobs = Object.entries(context.state.jobs)
    .filter((entry) => entry[1].phase === "pending")
    .slice(0, BATCH)
  const recipients = Object.keys(context.state.deliveries).slice(0, BATCH)
  if (!jobs.length && !recipients.length) return
  await context.setAlarm(Date.now() + RETRY_MS)
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
