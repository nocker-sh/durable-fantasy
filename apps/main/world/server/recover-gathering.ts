import type { NatureContext, GatherPlayers } from "#/world/server/nature-coordinator"
import { RETRY_MS, BATCH } from "#/world/server/nature-coordinator"
import { finishGather } from "#/world/server/finish-gather"

export async function recoverGathering(context: NatureContext, players: GatherPlayers): Promise<void> {
  const jobs = Object.entries(context.state.jobs)
    .filter((entry) => entry[1].phase === "pending")
    .slice(0, BATCH)
  if (!jobs.length) return
  await context.setAlarm(Date.now() + RETRY_MS)
  for (const entry of jobs) {
    const owner = entry[0]
    const job = entry[1]
    try {
      await finishGather({ context: context, players: players, owner: owner, id: job.request.id })
    } catch {
      delete context.state.jobs[owner]
      context.state.jobs[owner] = job
    }
  }
}
