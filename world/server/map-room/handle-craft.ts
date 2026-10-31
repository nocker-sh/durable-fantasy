import { Player } from "#/durable-objects/player"
import { REACH } from "#/world/core/gather-rules"
import { stationAt } from "#/world/town/stations"
import type { Transition } from "#/world/core/transition"
import type { Ctx, Message } from "#/world/server/map-room/context"
import { near } from "#/world/server/map-room/near"

/** Require the player to be beside the station before submitting the server-generated roll. */
export async function handleCraft(roomCtx: Ctx, message: Message<"craft">): Promise<void> {
  const ctx = roomCtx.ctx,
    key = roomCtx.key,
    me = roomCtx.me
  if (!me.player || !me.owner || me.engaged) return
  const station = stationAt(message.station)
  const answer = (result: Transition) => ctx.connection.send({ type: "result", seq: message.seq, result })
  if (!station || station.map !== key.map || !near(me, station.cell, REACH + 1)) return answer({ ok: false, reason: "TOO_FAR" })
  return answer(await Player.get(me.owner).run({ type: "craft", recipe: message.recipe, station: station.id, roll: Math.random() }))
}
