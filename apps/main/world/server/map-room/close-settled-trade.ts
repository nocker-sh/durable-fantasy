import { sameTrade } from "#/world/server/map-room/same-trade"
import { presence } from "#/world/server/map-room/presence"
import { setTrade } from "#/world/server/map-room/set-trade"
import type { Ctx } from "#/world/server/map-room/context"
import type { Presence, TradeSide } from "#/world/server/map-room/presence"

type Props = Readonly<{ room: Ctx; peer: Ctx["ctx"]["connection"]; mine: TradeSide; other: Presence; reason: string | null }>

/** 保存の完了を待つ間に始まった別の取引は閉じず、片方の通知失敗ももう片方へ波及させない。 */
export async function closeSettledTrade(props: Props): Promise<void> {
  const connection = props.room.ctx.connection
  const notifications: Promise<void>[] = []
  if (sameTrade(presence(connection).trade, props.mine)) {
    props.room.save({ trade: undefined })
    notifications.push(connection.send({ type: "trade-closed", reason: props.reason ?? "DONE" }))
  }
  if (sameTrade(presence(props.peer).trade, props.other.trade)) {
    setTrade(props.peer, undefined)
    notifications.push(props.peer.send({ type: "trade-closed", reason: props.reason ?? "DONE" }))
  }
  await Promise.allSettled(notifications)
}
