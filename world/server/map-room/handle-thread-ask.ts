import { TRADE_CELLS } from "#/world/core/trade-rules"
import { presence } from "#/world/server/map-room/presence"
import { reachable } from "#/world/server/map-room/reachable"
import { near } from "#/world/server/map-room/near"
import type { Message } from "#/world/server/map-room/context"
import type { ThreadRequestContext } from "#/world/server/map-room/thread-request-types"

/** 申込み先だけを保存し、受諾するまでは糸を渡さない。 */
export async function handleThreadAsk(roomCtx: ThreadRequestContext, message: Message<"thread-ask">) {
  const ctx = roomCtx.ctx
  const me = roomCtx.me
  const them = ctx.room.getConnection(message.target)
  const other = them && presence(them)
  if (!me.player || !me.owner || !them || !other?.player || them.id === ctx.connection.id) return
  const target = reachable(other).at(-1)
  if (!target || !near(me, target, TRADE_CELLS)) {
    await ctx.connection.send({ type: "thread-closed", reason: "TOO_FAR" })
    return
  }
  roomCtx.save({ threading: them.id })
  await them.send({ type: "thread-asked", from: ctx.connection.id, name: me.player.name })
  return
}
