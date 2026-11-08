import { apply } from "#/world/core/apply"
import { sameIntent } from "#/world/core/same-intent"
import { getOrderEscrowCommand } from "#/world/core/get-order-escrow-command"
import type { OrderIntent } from "#/world/core/exchange-types"
import type { PlayerState } from "#/world/core/player-types"
import type { HeldOrder, OrderEscrow } from "#/world/core/exchange-order-types"
type Props = Readonly<{ player: PlayerState; previous: OrderEscrow | null; id: number; intent: OrderIntent; now: number }>

/** Replay a saved receipt before consulting current definitions, and persist the maker with the same successful debit. */
export function holdOrder(props: Props): HeldOrder {
  if (!Number.isSafeInteger(props.id) || props.id <= 0) return { ok: false, reason: "NOT_READY" }
  if (props.previous && props.id <= props.previous.id) {
    if (props.id !== props.previous.id || !sameIntent(props.intent, props.previous.intent)) return { ok: false, reason: "NOT_READY" }
    return { ok: true, state: props.player, events: [], receipt: props.previous }
  }
  const escrow = getOrderEscrowCommand(props.player, props.intent)
  if ("reason" in escrow) return { ok: false, reason: escrow.reason }
  const result = apply(props.player, escrow.command, { now: props.now })
  if (!result.ok) return result
  return { ...result, receipt: { id: props.id, intent: structuredClone(props.intent), ...(escrow.by !== undefined ? { by: escrow.by } : {}) } }
}
