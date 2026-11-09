import { presence } from "#/world/server/map-room/presence"
import { sameTrade } from "#/world/server/map-room/same-trade"
import { setTrade } from "#/world/server/map-room/set-trade"
import type { Ctx, Message } from "#/world/server/map-room/context"

/** 現在の取引だけを取り消し、確定処理を始めた取引は保存先の回復処理へ任せる。 */
export async function handleTradeCancel(roomCtx: Ctx, _message: Message<"trade-cancel">) {
  const ctx = roomCtx.ctx
  const save = roomCtx.save
  const me = presence(ctx.connection)
  if (!sameTrade(me.trade, roomCtx.me.trade) || me.trade?.settling) return
  const them = me.trade ? ctx.room.getConnection(me.trade.with) : undefined
  save({ trade: undefined })
  if (them && presence(them).trade?.with === ctx.connection.id && presence(them).trade?.session === me.trade?.session) {
    setTrade(them, undefined)
    await them.send({ type: "trade-closed", reason: "CANCELLED" })
  }
  await ctx.connection.send({ type: "trade-closed", reason: "CANCELLED" })
  return
}
