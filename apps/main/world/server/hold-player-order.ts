import { holdOrder } from "#/world/core/hold-order"
import { restoreSavedPlayer } from "#/world/server/restore-saved-player"
import { publishPlayer } from "#/world/server/publish-player"
import type { Transition } from "#/world/core/transition"
import type { PlayerRecord } from "#/world/server/player-record"
import type { PlayerOrderInput } from "#/world/server/player-operation-types"

export function holdPlayerOrder(record: PlayerRecord, input: PlayerOrderInput, now: number): Transition & { by?: string } {
  if (record.trade?.status === "prepared" && record.orderEscrow?.id !== input.id) return { ok: false, reason: "NOT_READY" }
  const result = holdOrder({ player: restoreSavedPlayer(record.player), previous: record.orderEscrow, id: input.id, intent: input.intent, now })
  if (!result.ok) return result
  publishPlayer(record, result.state, record.orderEscrow?.id !== result.receipt.id)
  record.orderEscrow = result.receipt
  return { ok: true, state: record.player, events: result.events, ...(result.receipt.by !== undefined ? { by: result.receipt.by } : {}) }
}
