import { receiveCombat } from "#/world/core/receive-combat"
import { restoreSavedPlayer } from "#/world/server/restore-saved-player"
import { publishPlayer } from "#/world/server/publish-player"
import { freezePlayerLocation } from "#/world/server/freeze-player-location"
import type { CombatDelivery } from "#/world/core/combat-delivery-types"
import type { Transition } from "#/world/core/transition"
import type { PlayerRecord } from "#/world/server/player-record"

type Props = Readonly<{ record: PlayerRecord; source: string; delivery: CombatDelivery; now: number }>

/** Receipt and publication are saved by the same enclosing player operation. */
export function receivePlayerCombat(props: Props): Transition {
  const record = props.record
  if (!props.source) return { ok: false, reason: "NOT_READY" }
  const received = receiveCombat({
    player: restoreSavedPlayer(record.player),
    previous: record.combatReceipts[props.source],
    delivery: props.delivery,
    now: props.now,
    reserved: record.trade?.status === "prepared",
    life: record.combatLife,
  })
  if (received.receipt) record.combatReceipts[props.source] = received.receipt
  if (received.result.ok) {
    publishPlayer(record, received.result.state, !!received.receipt)
    if (received.result.state.hp <= 0) freezePlayerLocation(record, props.now)
  }
  return received.result.ok ? { ...received.result, state: record.player } : received.result
}
