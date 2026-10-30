import { expire } from "#/world/core/expire"
import { place } from "#/world/core/place"
import { escrowFor } from "#/world/core/escrow-for"
import type { Transition } from "#/world/core/transition"
import type { ExchangeContext, ExchangePlayers } from "#/world/server/exchange-coordinator"
import { RETRY_MS } from "#/world/server/exchange-coordinator"

type Props = {
  context: ExchangeContext
  players: ExchangePlayers
  owner: string
  id: number
}

export async function advanceExchangeOrder(props: Props): Promise<Transition> {
  const job = props.context.state.requests.jobs[props.owner]
  if (!job || job.id !== props.id) return { ok: false, reason: "NOT_READY" }
  if (job.phase === "refused") return { ok: false, reason: job.reason }
  if (job.phase === "done") return { ok: true, state: await props.players(props.owner).read(), events: [] }
  await props.context.setAlarm(Date.now() + RETRY_MS)
  const paid = await props.players(props.owner).holdOrder(job.id, job.intent)
  if (!paid.ok) {
    props.context.state.requests.jobs[props.owner] = { ...job, phase: "refused", reason: paid.reason }
    return paid
  }
  const now = Date.now()
  props.context.state.ex = place(expire(props.context.state.ex, now), { owner: props.owner, name: job.name, ...job.intent, ...(paid.by !== undefined ? { by: paid.by } : {}) }, now).state
  props.context.state.ex.fees += escrowFor(job.intent.side, job.intent.price, job.intent.qty).fee
  props.context.state.requests.jobs[props.owner] = { ...job, phase: "done" }
  return paid
}
