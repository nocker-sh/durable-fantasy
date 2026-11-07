import { runPlayerCommand } from "#/world/server/run-player-command"
import type { PlayerRecord } from "#/world/server/player-record"
import type { CraftRequest } from "#/world/server/craft-request-types"
import type { Transition } from "#/world/core/transition"

type Props = Readonly<{ record: PlayerRecord; request: CraftRequest; now: number }>

/** Persist the receipt with materials, fee and output; a retry never rerolls or republishes. */
export function runPlayerCraft(props: Props): Transition {
  const record = props.record,
    request = props.request
  if (!request.connection || record.location?.connection !== request.connection || !Number.isSafeInteger(request.seq) || request.seq < 0) return { ok: false, reason: "NOT_READY" }
  const previous = record.craftReceipt
  if (previous?.request.connection === request.connection && request.seq <= previous.request.seq) {
    if (request.seq !== previous.request.seq || request.recipe !== previous.request.recipe || request.station !== previous.request.station) return { ok: false, reason: "NOT_READY" }
    return previous.outcome.ok ? { ok: true, state: record.player, events: [] } : previous.outcome
  }
  if (!Number.isFinite(request.roll) || request.roll < 0 || request.roll >= 1 || typeof request.recipe !== "string" || typeof request.station !== "string") return { ok: false, reason: "NOT_READY" }
  const result = runPlayerCommand(record, { command: { type: "craft", recipe: request.recipe, station: request.station, roll: request.roll }, context: {} }, props.now)
  record.craftReceipt = { request: { connection: request.connection, seq: request.seq, recipe: request.recipe, station: request.station }, outcome: result.ok ? { ok: true } : result }
  return result
}
