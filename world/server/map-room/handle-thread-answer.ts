import { threadOf } from "#/world/core/thread-of"
import { Player } from "#/durable-objects/player"
import { presence } from "#/world/server/map-room/presence"
import { setPresence } from "#/world/server/map-room/set-presence"
import type { Message } from "#/world/server/map-room/context"
import type { ThreadRequestContext } from "#/world/server/map-room/thread-request-types"

/** 同じ時刻で双方の糸を作り、元の順に本人の保存結果を送る。 */
export async function handleThreadAnswer(roomCtx: Omit<ThreadRequestContext, "save">, message: Message<"thread-answer">) {
  const ctx = roomCtx.ctx
  const me = roomCtx.me
  const them = ctx.room.getConnection(message.from)
  const other = them && presence(them)
  if (!me.player || !me.owner || !them || !other?.owner || !other.player || other.threading !== ctx.connection.id) return
  setPresence(them, { threading: undefined })
  if (!message.yes) {
    await them.send({ type: "thread-closed", reason: "DECLINED" })
    return
  }
  // each keeps the other's thread
  const now = Date.now()
  await ctx.connection.send({ type: "result", seq: -1, result: await Player.get(me.owner).run({ type: "thread", thread: threadOf(other.owner, other.player.name, now) }) })
  await them.send({ type: "result", seq: -1, result: await Player.get(other.owner).run({ type: "thread", thread: threadOf(me.owner, me.player.name, now) }) })
  return
}
