import { Player } from "#/durable-objects/player"
import { commissionOf } from "#/world/core/commission-of"
import { sameCommissionOrders } from "#/world/core/same-commission-orders"
import type { Transition } from "#/world/core/transition"
import { TALK_CELLS } from "#/world/maps"
import { npcCell } from "#/world/maps/npc-cell"
import type { Ctx, Message } from "#/world/server/map-room/context"
import { timeFor } from "#/world/server/map-room/time-for"
import { near } from "#/world/server/map-room/near"

/** Check the displayed order queue before selecting the craftsman, then let the player recheck it atomically. */
export async function handleCommission(roomCtx: Ctx, message: Message<"order" | "collect">): Promise<void> {
  const ctx = roomCtx.ctx,
    map = roomCtx.map,
    me = roomCtx.me
  if (!me.player || !me.owner) return
  const answer = (result: Transition) => ctx.connection.send({ type: "result", seq: message.seq, result })
  // the craftsman has to be at their counter, and we beside them
  if (message.type === "collect") {
    const data = await Player.get(me.owner).read()
    if (!sameCommissionOrders(data.orders, message.orders)) return answer({ ok: false, reason: "ORDER_CHANGED" })
  }
  const job = commissionOf(message.type === "order" ? message.commission : (message.orders[message.index]?.commission ?? ""))
  const cell = job && npcCell(map, job.craftsman, timeFor(me))
  if (!job || !cell || !near(me, cell, TALK_CELLS + 1)) return answer({ ok: false, reason: "TOO_FAR" })
  return answer(
    await Player.get(me.owner).run(message.type === "order" ? { type: "order", commission: job.id, roll: Math.random() } : { type: "collect", index: message.index, expectedOrders: message.orders }),
  )
}
