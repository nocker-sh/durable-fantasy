import { TRADE_CELLS } from "#/world/core/trade-rules"
import { cellsReached } from "#/world/cells-reached"
import { cellDistance } from "#/world/maps/cell-distance"
import type { Presence } from "#/world/server/map-room/presence"
import type { TradeAnswerDecision } from "#/world/server/map-room/trade-answer-types"

type Props = Readonly<{ recipient: Presence; asker: Presence; accepted: boolean; now: number }>

/** 辞退と変更された参加状態を先に扱い、同じ時刻で調べた停止地点を保存へ渡す。 */
export function getTradeAnswer(props: Props): TradeAnswerDecision {
  if (!props.accepted) return { ok: false, reason: "DECLINED" }
  const recipient = props.recipient
  const asker = props.asker
  if (!recipient.owner || !asker.owner || asker.closed || recipient.closed || recipient.trade?.open || recipient.down || asker.down || recipient.engaged || asker.engaged)
    return { ok: false, reason: "BUSY" }
  const here = cellsReached(recipient.route, (props.now - recipient.since) / 1000)
  const recipientAt = here.at(-1)
  const askerAt = cellsReached(asker.route, (props.now - asker.since) / 1000).at(-1)
  if (!recipientAt || !askerAt || !here.some((cell) => cellDistance(cell, askerAt) <= TRADE_CELLS)) return { ok: false, reason: "TOO_FAR" }
  return { ok: true, recipientAt: [recipientAt[0], recipientAt[1]], askerAt: [askerAt[0], askerAt[1]] }
}
