// Public speech is limited by hearing distance, except for a map-wide shout.
import { cellDistance } from "../../maps/index.ts"
import { HEARING_CELLS } from "../../protocol.ts"
import type { Ctx, Handlers, Message } from "./context.ts"
import { presence, reachable } from "./presence.ts"
import { notifyClient } from "./notifications.ts"

async function say(roomCtx: Ctx, message: Message<"say">) {
  const { ctx, me, save } = roomCtx
  if (!me.player) return
  // at most two lines a second
  const now = Date.now()
  const said = [...me.said.filter((t) => now - t < 1000), now]
  save({ said })
  if (said.length > 2) return
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
