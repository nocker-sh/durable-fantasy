import { receiveShop } from "#/world/core/receive-shop"
import { restoreSavedPlayer } from "#/world/server/restore-saved-player"
import { publishPlayer } from "#/world/server/publish-player"
import type { ShopQuote } from "#/world/core/shop-receipt-types"
import type { Transition } from "#/world/core/transition"
import type { PlayerRecord } from "#/world/server/player-record"

type Props = Readonly<{ record: PlayerRecord; source: string; quote: ShopQuote; now: number }>

/** Receipt and publication are saved by the same enclosing player operation. */
export function receivePlayerShop(props: Props): Transition {
  const record = props.record
  if (!props.source) return { ok: false, reason: "NOT_READY" }
  const received = receiveShop({
    player: restoreSavedPlayer(record.player),
    previous: record.shopReceipts[props.source],
    quote: props.quote,
    now: props.now,
    reserved: record.trade?.status === "prepared",
  })
  if (received.receipt) record.shopReceipts[props.source] = received.receipt
  if (received.result.ok) publishPlayer(record, received.result.state, !!received.receipt)
  return received.result.ok ? { ...received.result, state: record.player } : received.result
}
