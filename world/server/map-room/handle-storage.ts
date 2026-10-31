import { STORAGE_KEEPER } from "#/world/core/storage/rules"
import { storageOpen } from "#/world/town/warehouse"
import { Player } from "#/durable-objects/player"
import type { Transition } from "#/world/core/transition"
import { TALK_CELLS } from "#/world/maps"
import { npcCell } from "#/world/maps/npc-cell"
import type { Ctx, Message } from "#/world/server/map-room/context"
import { timeFor } from "#/world/server/map-room/time-for"
import { near } from "#/world/server/map-room/near"

/** Preserve both the counter check and the displayed stack for the authoritative storage command. */
export async function handleStorage(roomCtx: Ctx, message: Message<"storage">): Promise<void> {
  const ctx = roomCtx.ctx,
    map = roomCtx.map,
    me = roomCtx.me
  if (!me.player || !me.owner) return
  const answer = (result: Transition) => ctx.connection.send({ type: "result", seq: message.seq, result })
  // Hilde has to be at her counter, and we beside her
  const cell = npcCell(map, STORAGE_KEEPER, timeFor(me))
  if (!storageOpen(timeFor(me))) return answer({ ok: false, reason: "CLOSED" })
  if (!cell || !near(me, cell, TALK_CELLS + 1)) return answer({ ok: false, reason: "TOO_FAR" })
  return answer(
    await Player.get(me.owner).run(
      message.action === "store"
        ? { type: "store", slot: message.index, count: message.count, expectedStack: message.stack }
        : { type: "retrieve", index: message.index, count: message.count, expectedStack: message.stack },
    ),
  )
}
