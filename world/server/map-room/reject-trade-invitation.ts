import { setTrade } from "#/world/server/map-room/set-trade"
import type { Message } from "#/world/server/map-room/context"
import type { TradeAnswerContext, TradeAnswerConnection } from "#/world/server/map-room/trade-answer-types"

type Props = Readonly<{ room: TradeAnswerContext; asker: TradeAnswerConnection; message: Message<"trade-answer">; reason: string }>

/** 招待だけを取り消し、返答者が別に開始した取引へ取消通知を送らない。 */
export async function rejectTradeInvitation(props: Props): Promise<void> {
  setTrade(props.asker, undefined)
  await props.asker.send({ type: "trade-closed", reason: props.reason })
  if (props.message.yes && !props.room.me.trade?.open) await props.room.ctx.connection.send({ type: "trade-closed", reason: props.reason })
}
