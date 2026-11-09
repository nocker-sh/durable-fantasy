import { expire } from "#/world/core/expire"
import { place } from "#/world/core/place"
import { escrowFor } from "#/world/core/escrow-for"
import { orderFailure } from "#/world/core/order-failure"
import { creditExchangeInbox } from "#/world/core/credit-exchange-inbox"
import { heldExchangeItem } from "#/world/core/held-exchange-item"
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
  // checked when asked, but no longer placeable (a symbol retired by a deploy since): give everything held back
  // through the inbox, fee too since nothing was listed, rather than throw and retry forever with the escrow held
  const failure = orderFailure(job.intent)
  if (failure) {
    const escrow = escrowFor(job.intent.side, job.intent.price, job.intent.qty)
    if (job.intent.side === "buy") creditExchangeInbox({ inbox: props.context.state.ex.inbox, owner: props.owner, gold: escrow.gold })
    else creditExchangeInbox({ inbox: props.context.state.ex.inbox, owner: props.owner, gold: escrow.fee, item: heldExchangeItem({ symbol: job.intent.symbol, by: paid.by }, job.intent.qty) })
    props.context.state.requests.jobs[props.owner] = { ...job, phase: "refused", reason: failure }
    return { ok: false, reason: failure }
  }
  const now = Date.now()
  props.context.state.ex = place(expire(props.context.state.ex, now), { owner: props.owner, name: job.name, ...job.intent, ...(paid.by !== undefined ? { by: paid.by } : {}) }, now).state
  props.context.state.ex.fees += escrowFor(job.intent.side, job.intent.price, job.intent.qty).fee
  props.context.state.requests.jobs[props.owner] = { ...job, phase: "done" }
  return paid
}
