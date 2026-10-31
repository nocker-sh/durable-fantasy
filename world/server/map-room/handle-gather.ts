import { withoutKeys } from "#/lib/engine/without-keys"
import { Nature } from "#/durable-objects/nature"
import { REACH } from "#/world/core/gather-rules"
import { nodeOf } from "#/world/core/node-of"
import type { Transition } from "#/world/core/transition"
import type { Ctx, Message } from "#/world/server/map-room/context"
import { near } from "#/world/server/map-room/near"

/** Reserve shared resources before the player receives the authoritative gathering result. */
export async function handleGather(roomCtx: Ctx, message: Message<"gather">): Promise<void> {
  const ctx = roomCtx.ctx,
    key = roomCtx.key,
    me = roomCtx.me
  if (!me.player || !me.owner || me.engaged) return
  const node = nodeOf(message.node)
  const answer = (result: Transition) => ctx.connection.send({ type: "result", seq: message.seq, result })
  if (!node || node.map !== key.map || !near(me, node.cell, REACH)) return answer({ ok: false, reason: "TOO_FAR" })
  const nature = Nature.get(`town-${key.world}`)
  const request = await nature.beginGather({ owner: me.owner, connection: ctx.connection.id, seq: message.seq, node: node.id })
  if (!request.ok) return answer(request)
  const leftSource = await nature.finishGather(me.owner, request.id),
    left = leftSource.left,
    result = withoutKeys(leftSource, ["left"])
  await answer(result)
  if (left !== undefined) await ctx.room.broadcast({ type: "nodes", left: { [node.id]: left } })
  return
}
