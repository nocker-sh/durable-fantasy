import { receiveGather } from "#/world/core/receive-gather"
import { restoreSavedPlayer } from "#/world/server/restore-saved-player"
import { publishPlayer } from "#/world/server/publish-player"
import type { GatherRequest } from "#/world/core/gather-receipt-types"
import type { Transition } from "#/world/core/transition"
import type { PlayerRecord } from "#/world/server/player-record"

type Props = Readonly<{ record: PlayerRecord; source: string; request: GatherRequest; now: number }>

/** Receipt and publication are saved by the same enclosing player operation. */
export function receivePlayerGather(props: Props): Transition {
  const record = props.record
  if (!props.source) return { ok: false, reason: "NOT_READY" }
  const received = receiveGather({
    player: restoreSavedPlayer(record.player),
    previous: record.gatherReceipts[props.source],
    request: props.request,
    now: props.now,
    reserved: record.trade?.status === "prepared",
  })
  if (received.receipt) record.gatherReceipts[props.source] = received.receipt
  if (received.result.ok) publishPlayer(record, received.result.state, !!received.receipt)
  return received.result.ok ? { ...received.result, state: record.player } : received.result
}
