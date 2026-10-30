// Public speech is limited by hearing distance, except for a map-wide shout.
import { cellDistance } from "#/world/maps/cell-distance"
import { HEARING_CELLS } from "#/world/protocol"
import type { Ctx, Handlers, Message } from "./context"
import { presence } from "#/world/server/map-room/presence"
import { reachable } from "#/world/server/map-room/reachable"
import { notifyClient } from "./notifications"

async function say(roomCtx: Ctx, message: Message<"say">) {
  const ctxSource = roomCtx,
    ctx = ctxSource.ctx,
    me = ctxSource.me,
    save = ctxSource.save
  if (!me.player) return
  // at most two lines a second
  const now = Date.now()
  // Two recent attempts already fill the window; older ones cannot change the decision.
  // Keep rejected attempts too, so continuous sending still extends the wait.
  const recent = me.said.slice(-2).filter((t) => now - t < 1000)
  save({ said: [...recent, now].slice(-2) })
  if (recent.length >= 2) return
  const shout = !!message.shout
  const from = reachable(me)[0]
  for (const other of ctx.room.getConnections()) {
    const them = presence(other)
    if (other.id === ctx.connection.id || !them.player || them.closed) continue
    if (shout || reachable(them).some((c) => cellDistance(c, from) <= HEARING_CELLS)) await notifyClient(other.send({ type: "said", id: me.player.id, text: message.text, shout }))
  }
  return
}

export const HANDLERS: Handlers = { say }
