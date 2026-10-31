import { Player } from "#/durable-objects/player"
import type { Transition } from "#/world/core/transition"
import { TALK_CELLS } from "#/world/maps"
import { npcCell } from "#/world/maps/npc-cell"
import type { Ctx, Message } from "#/world/server/map-room/context"
import { timeFor } from "#/world/server/map-room/time-for"
import { near } from "#/world/server/map-room/near"

/** Require the resident to be present and nearby before taking or handing over an errand. */
export async function handleErrand(roomCtx: Ctx, message: Message<"errand">): Promise<void> {
  const ctx = roomCtx.ctx,
    map = roomCtx.map,
    me = roomCtx.me
  if (!me.player || !me.owner) return
  const answer = (result: Transition) => ctx.connection.send({ type: "result", seq: message.seq, result })
  // the resident has to be where they are at this hour, and we beside them
  const cell = npcCell(map, message.resident, timeFor(me))
  if (!cell || !near(me, cell, TALK_CELLS + 1)) return answer({ ok: false, reason: "TOO_FAR" })
  return answer(
    await Player.get(me.owner).run(
      message.action === "take" ? { type: "errand-take", errand: message.errand, from: message.resident } : { type: "errand-hand", errand: message.errand, to: message.resident },
    ),
  )
}
