import { payStrike } from "#/world/core/combat-payment"
import { restoreSavedPlayer } from "#/world/server/restore-saved-player"
import { publishPlayer } from "#/world/server/publish-player"
import type { Transition } from "#/world/core/transition"
import type { PlayerRecord } from "#/world/server/player-record"
import type { PlayerStrikeInput } from "#/world/server/player-operation-types"

export function payPlayerStrike(record: PlayerRecord, input: PlayerStrikeInput, now: number): Transition {
  if (!input.source) return { ok: false, reason: "NOT_READY" }
  const paid = payStrike({
    player: restoreSavedPlayer(record.player),
    previous: record.combatPayments[input.source],
    request: { id: input.id, art: input.art, life: input.life },
    context: { now, reserved: record.trade?.status === "prepared", life: record.combatLife },
  })
  if (paid.receipt) record.combatPayments[input.source] = paid.receipt
  if (paid.result.ok) publishPlayer(record, paid.result.state, !!input.art && !!paid.receipt)
  return paid.result.ok ? { ...paid.result, state: record.player } : paid.result
}
