import { takeOne } from "#/world/core/nature/take-one"
import type { Transition } from "#/world/core/transition"
import { restoreNature } from "#/world/server/restore-nature"
import type { NatureContext, GatherPlayers } from "#/world/server/nature-coordinator"

type Props = {
  context: NatureContext
  players: GatherPlayers
  owner: string
  connection: string
  seq: number
  node: string
}

export async function beginGather(props: Props): Promise<{ ok: true; id: number } | Extract<Transition, { ok: false }>> {
  if (!props.owner || !props.connection || !Number.isSafeInteger(props.seq) || props.seq < 0) return { ok: false, reason: "NOT_READY" }
  const previous = props.context.state.jobs[props.owner]
  if (previous?.connection === props.connection && props.seq <= previous.seq)
    return props.seq === previous.seq && previous.request.node === props.node ? { ok: true, id: previous.request.id } : { ok: false, reason: "NOT_READY" }
  if (previous?.phase === "pending" || !(await props.players(props.owner).ownsConnection(props.connection))) return { ok: false, reason: "NOT_READY" }
  const id = props.context.state.serial + 1
  if (!Number.isSafeInteger(id)) throw new Error("Gathering IDs exhausted")
  const next = takeOne(restoreNature(props.context.state.nature), props.node, Date.now())
  if (!next) return { ok: false, reason: "SPENT" }
  props.context.state.nature = next
  props.context.state.serial = id
  props.context.state.jobs[props.owner] = { connection: props.connection, seq: props.seq, request: { id, node: props.node, roll: Math.random() }, phase: "pending" }
  await props.context.setAlarm(Date.now() + 100)
  return { ok: true, id }
}
