import { TRADE_CELLS } from "#/world/core/trade-rules"
import { emptyOffer } from "#/world/core/empty-offer"
import { presence } from "#/world/server/map-room/presence"
import { near } from "#/world/server/map-room/near"
import { reachable } from "#/world/server/map-room/reachable"
import type { Ctx, Message } from "#/world/server/map-room/context"

type Connection = Pick<Ctx["ctx"]["connection"], "id" | "state" | "send">
type Props = Readonly<{ me: Ctx["me"]; save: Ctx["save"]; ctx: Readonly<{ connection: Pick<Connection, "id" | "send">; room: Readonly<{ getConnection(id: string): Connection | undefined }> }> }>

/** 招待は提示と承認を初期化するだけで、相手の持ち物や取引を予約しない。 */
export async function handleTradeAsk(roomCtx: Props, message: Message<"trade-ask">) {
  const ctx = roomCtx.ctx
  const me = roomCtx.me
  const them = ctx.room.getConnection(message.target)
  const other = them && presence(them)
  if (!me.player || !me.owner || me.trade?.open || me.down || me.engaged || !them || !other?.player || other.trade?.open || other.down || other.engaged || them.id === ctx.connection.id) {
    await ctx.connection.send({ type: "trade-closed", reason: "BUSY" })
    return
  }
  const target = reachable(other).at(-1)
  if (!target || !near(me, target, TRADE_CELLS)) {
    await ctx.connection.send({ type: "trade-closed", reason: "TOO_FAR" })
    return
  }
  roomCtx.save({ trade: { with: them.id, open: false, offer: emptyOffer(), shown: [], locked: false, done: false } })
  await them.send({ type: "trade-asked", from: ctx.connection.id, name: me.player.name })
  return
}
