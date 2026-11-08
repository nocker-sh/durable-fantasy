import { threadOf } from "#/world/core/thread-of"
import { Player } from "#/durable-objects/player"
import { presence } from "#/world/server/map-room/presence"
import { setPresence } from "#/world/server/map-room/set-presence"
import { getTradeAnswer } from "#/world/server/map-room/get-trade-answer"
import { notifyClient } from "#/world/server/map-room/notifications"
import type { Message } from "#/world/server/map-room/context"
import type { ThreadRequestContext } from "#/world/server/map-room/thread-request-types"

/** 受けた時点の距離と状態を取引と同じく確かめ、返答者の糸が保存できた場合だけ申込者にも糸を渡す。 */
export async function handleThreadAnswer(roomCtx: Omit<ThreadRequestContext, "save">, message: Message<"thread-answer">) {
  const ctx = roomCtx.ctx
  const me = roomCtx.me
  const them = ctx.room.getConnection(message.from)
  const other = them && presence(them)
  if (!me.player || !me.owner || !them || !other?.owner || !other.player || other.threading !== ctx.connection.id) return
  setPresence(them, { threading: undefined })
  const now = Date.now()
  const answer = getTradeAnswer({ recipient: me, asker: other, accepted: message.yes, now })
  if (!answer.ok) {
    await them.send({ type: "thread-closed", reason: answer.reason })
    if (answer.reason !== "DECLINED") await ctx.connection.send({ type: "thread-closed", reason: answer.reason })
    return
  }
  // each keeps the other's thread: the second is saved only once the first is
  const mine = await Player.get(me.owner).run({ type: "thread", thread: threadOf(other.owner, other.player.name, now) })
  await notifyClient(ctx.connection.send({ type: "result", seq: -1, result: mine }))
  if (!mine.ok) {
    await them.send({ type: "thread-closed", reason: "BUSY" })
    return
  }
  const theirs = await Player.get(other.owner).run({ type: "thread", thread: threadOf(me.owner, me.player.name, now) })
  await notifyClient(them.send({ type: "result", seq: -1, result: theirs }))
}
