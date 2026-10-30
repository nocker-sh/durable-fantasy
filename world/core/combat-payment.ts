// One latest acceptance per wild object; normal blows use the same checkpoint without spending SP.
import { settle } from "#/world/core/settle"
import { derive } from "#/world/core/derive"
import { getStrikePayment } from "#/world/core/get-strike-payment"
import type { PlayerState } from "#/world/core/player-types"
import type { Reason } from "#/world/core/commands"
import type { SkillId } from "#/world/core/skill-types"
import type { Transition } from "#/world/core/transition"

export type CombatRequest = {
  id: number
  art?: SkillId
  life?: number
}
export type CombatPayment = CombatRequest & {
  outcome: { ok: true } | { ok: false; reason: Reason }
}
export function payStrike(inputProps: { player: PlayerState; previous: CombatPayment | undefined; request: CombatRequest; context: { now: number; reserved: boolean; life: number } }): {
  result: Transition
  receipt?: CombatPayment
} {
  const player = inputProps.player
  const previous = inputProps.previous
  const request = inputProps.request
  const context = inputProps.context

  const idSource = request,
    id = idSource.id,
    art = idSource.art,
    expectedLife = idSource.life
  const nowSource = context,
    now = nowSource.now,
    reserved = nowSource.reserved,
    currentLife = nowSource.life
  if (!Number.isSafeInteger(id) || id <= 0) return { result: { ok: false, reason: "NOT_READY" } }
  if (expectedLife !== undefined && (!Number.isSafeInteger(expectedLife) || expectedLife < 0)) return { result: { ok: false, reason: "NOT_READY" } }
  if (previous && id <= previous.id) {
    if (id !== previous.id || art !== previous.art || (previous.life !== undefined && previous.life !== expectedLife)) return { result: { ok: false, reason: "NOT_READY" } }
    return { result: previous.outcome.ok ? { ok: true, state: player, events: [] } : previous.outcome }
  }
  const state = settle(player, derive(player), now)
  const result = getStrikePayment({ player: state, isReserved: reserved, art, expectedLife, currentLife, now })
  return { result, receipt: { id, ...(art ? { art } : {}), ...(expectedLife !== undefined ? { life: expectedLife } : {}), outcome: result.ok ? { ok: true } : result } }
}
