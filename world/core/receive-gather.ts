import { apply } from "#/world/core/apply"
import { nodeOf } from "#/world/core/node-of"
import type { GatherRequest, GatherReceipt } from "#/world/core/gather-receipt-types"
import type { PlayerState } from "#/world/core/player-types"
import type { Transition } from "#/world/core/transition"

type Props = { player: PlayerState; previous: GatherReceipt | undefined; request: GatherRequest; now: number; reserved: boolean }

/** 記録済みの抽選と結果を再送へ返し、成果と消費を再適用しない。 */
export function receiveGather(props: Props): { result: Transition; receipt?: GatherReceipt } {
  const request = props.request,
    previous = props.previous
  if (!Number.isSafeInteger(request.id) || request.id <= 0) return { result: { ok: false, reason: "NOT_READY" } }
  if (previous && request.id <= previous.request.id) {
    if (request.id !== previous.request.id || request.node !== previous.request.node || request.roll !== previous.request.roll) return { result: { ok: false, reason: "NOT_READY" } }
    if (!previous.outcome.ok) return { result: previous.outcome }
    return { result: { ok: true, state: props.player, events: [] } }
  }
  if (!nodeOf(request.node) || !Number.isFinite(request.roll) || request.roll < 0 || request.roll >= 1) return { result: { ok: false, reason: "NOT_READY" } }
  const received: { result: Transition } = { result: { ok: false, reason: "NOT_READY" } }
  if (!props.reserved) received.result = apply(props.player, { type: "gather", node: request.node, roll: request.roll }, { now: props.now })

  return { result: received.result, receipt: { request: { ...request }, outcome: received.result.ok ? { ok: true } : received.result } }
}
