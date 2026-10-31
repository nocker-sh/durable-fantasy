import { TRADE_CELLS } from "#/world/core/trade-rules"
import { near } from "#/world/server/map-room/near"
import { reachable } from "#/world/server/map-room/reachable"
import type { Presence } from "#/world/server/map-room/presence"

type Props = Readonly<{ recipient: Presence; asker: Presence; accepted: boolean }>

/** 招待は相手を拘束しないため、返答時点の状態と距離を調べる。辞退を先に扱う。 */
export function getTradeAnswerRejection(props: Props): "DECLINED" | "BUSY" | "TOO_FAR" | null {
  const target = reachable(props.asker).at(-1)
  if (!props.accepted) return "DECLINED"
  const recipient = props.recipient
  const asker = props.asker
  if (!recipient.owner || !asker.owner || asker.closed || recipient.closed || recipient.trade?.open || recipient.down || asker.down || recipient.engaged || asker.engaged) return "BUSY"
  if (!target || !near(recipient, target, TRADE_CELLS)) return "TOO_FAR"

  return null
}
