// The map room's handlers for swapping muffler threads (core/threads.ts).
import { threadOf } from "../../core/threads.ts"
import { TRADE_CELLS } from "../../core/trade.ts"
import { Player } from "../../../durable-objects/player.ts"
import type { Ctx, Handlers, Message } from "./context.ts"
import { presence, setPresence, reachable, near } from "./presence.ts"

async function threadAsk(roomCtx: Ctx, message: Message<"thread-ask">) {
  const { ctx, me, save } = roomCtx
  const them = ctx.room.getConnection(message.target)
  const other = them && presence(them)
  if (!me.player || !me.owner || !them || !other?.player || them.id === ctx.connection.id) return
  if (!near(me, reachable(other).at(-1)!, TRADE_CELLS)) {
    await ctx.connection.send({ type: "thread-closed", reason: "TOO_FAR" })
    return
  }
  save({ threading: them.id })
  await them.send({ type: "thread-asked", from: ctx.connection.id, name: me.player.name })
  return
}

async function threadAnswer(roomCtx: Ctx, message: Message<"thread-answer">) {
  const { ctx, me } = roomCtx
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

export const HANDLERS: Handlers = {
  "thread-ask": threadAsk,
  "thread-answer": threadAnswer,
}
