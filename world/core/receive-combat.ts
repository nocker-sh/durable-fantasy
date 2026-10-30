import { apply } from "#/world/core/apply"
import { sameCombatCommand } from "#/world/core/same-combat-command"
import type { CombatDelivery } from "#/world/core/combat-delivery-types"
import type { PlayerState } from "#/world/core/player-types"
import type { Transition } from "#/world/core/transition"

type Props = { player: PlayerState; previous: CombatDelivery | undefined; delivery: CombatDelivery; now: number; reserved: boolean; life: number }

/** 既読の通知は再適用せず、古い世代の反撃で復活後の HP を減らさない。 */
export function receiveCombat(props: Props): { result: Transition; receipt?: CombatDelivery } {
  const delivery = props.delivery,
    previous = props.previous
  if (!Number.isSafeInteger(delivery.id) || delivery.id <= 0) return { result: { ok: false, reason: "NOT_READY" } }
  if (previous && delivery.id <= previous.id) {
    if (delivery.id !== previous.id || delivery.life !== previous.life || !sameCombatCommand(delivery.command, previous.command)) return { result: { ok: false, reason: "NOT_READY" } }
    return { result: { ok: true, state: props.player, events: [] } }
  }
  if (delivery.command.type === "hurt" && (typeof delivery.life !== "number" || !Number.isSafeInteger(delivery.life) || delivery.life < 0)) return { result: { ok: false, reason: "NOT_READY" } }
  if (props.reserved) return { result: { ok: false, reason: "NOT_READY" } }
  if (delivery.command.type === "hurt" && (props.player.hp <= 0 || delivery.life !== props.life)) {
    return { result: { ok: true, state: props.player, events: [] }, receipt: structuredClone(delivery) }
  }
  const result = apply(props.player, delivery.command, { now: props.now })

  return { result, ...(result.ok ? { receipt: structuredClone(delivery) } : {}) }
}
