import { orderFailure } from "#/world/core/order-failure"
import type { OrderIntent } from "#/world/core/exchange-types"
import { sameIntent } from "#/world/core/same-intent"
import type { OrderJob } from "#/world/core/exchange-order-types"
import type { Transition } from "#/world/core/transition"
import type { ExchangeContext, ExchangePlayers } from "#/world/server/exchange-coordinator"

type Props = {
  context: ExchangeContext
  players: ExchangePlayers
  owner: string
  connection: string
  seq: number
  name: string
  intent: OrderIntent
}

export async function beginExchangeOrder(props: Props): Promise<{ ok: true; id: number } | Extract<Transition, { ok: false }>> {
  if (!props.connection || !Number.isSafeInteger(props.seq) || props.seq < 0) return { ok: false, reason: "NOT_READY" }
  const previous = props.context.state.requests.jobs[props.owner]
  if (previous?.connection === props.connection && props.seq <= previous.seq) {
    return props.seq === previous.seq && sameIntent(props.intent, previous.intent) ? { ok: true, id: previous.id } : { ok: false, reason: "NOT_READY" }
  }
  const reason = orderFailure(props.intent)
  if (reason) return { ok: false, reason }
  if (previous?.phase === "pending" || !(await props.players(props.owner).ownsConnection(props.connection))) return { ok: false, reason: "NOT_READY" }
  const id = props.context.state.requests.serial + 1
  if (!Number.isSafeInteger(id)) throw new Error("Exchange order IDs exhausted")
  const job: OrderJob = { id, connection: props.connection, seq: props.seq, name: props.name, intent: structuredClone(props.intent), phase: "pending" }
  props.context.state.requests = { serial: id, jobs: { ...props.context.state.requests.jobs, [props.owner]: job } }
  await props.context.setAlarm(Date.now() + 100)
  return { ok: true, id }
}
