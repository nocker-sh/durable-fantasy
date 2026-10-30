import { giveOne } from "#/world/core/nature/give-one"
import { leftAt } from "#/world/core/nature/left-at"
import type { Transition } from "#/world/core/transition"
import { restoreNature } from "#/world/server/restore-nature"
import type { NatureContext, GatherPlayers } from "#/world/server/nature-coordinator"
import { RETRY_MS } from "#/world/server/nature-coordinator"

type Props = {
  context: NatureContext
  players: GatherPlayers
  owner: string
  id: number
}

export async function finishGather(props: Props): Promise<Transition & { left?: number }> {
  restoreNature(props.context.state.nature)
  const job = props.context.state.jobs[props.owner]
  if (!job || job.request.id !== props.id) return { ok: false, reason: "NOT_READY" }
  if (job.phase === "pending") await props.context.setAlarm(Date.now() + RETRY_MS)
  const result = await props.players(props.owner).receiveGather(props.context.id.toString(), job.request)
  const now = Date.now()
  if (job.phase === "pending") {
    if (!result.ok) props.context.state.nature = giveOne(props.context.state.nature, job.request.node, now)
    props.context.state.jobs[props.owner] = { ...job, phase: "done" }
  }
  return { ...result, left: leftAt(props.context.state.nature, job.request.node, now) }
}
