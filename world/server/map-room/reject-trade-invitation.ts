import { setTrade } from "#/world/server/map-room/set-trade"
import type { Ctx, Message } from "#/world/server/map-room/context"

type Props = Readonly<{ room: Ctx; asker: Ctx["ctx"]["connection"]; message: Message<"trade-answer">; reason: string }>

/** 招待だけを取り消し、返答者が別に開始した取引へ取消通知を送らない。 */
export async function rejectTradeInvitation(props: Props): Promise<void> {
  setTrade(props.asker, undefined)
  await props.asker.send({ type: "trade-closed", reason: props.reason })
  if (props.message.yes && !props.room.me.trade?.open) await props.room.ctx.connection.send({ type: "trade-closed", reason: props.reason })
}
