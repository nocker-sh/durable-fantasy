import { TALK_CELLS } from "#/world/maps"
import { npcCell } from "#/world/maps/npc-cell"
import { timeFor } from "#/world/server/map-room/time-for"
import { near } from "#/world/server/map-room/near"
import { reachable } from "#/world/server/map-room/reachable"
import type { Cell } from "#/world/protocol"
import type { Ctx, Message } from "#/world/server/map-room/context"

type Props = Readonly<Pick<Ctx, "me" | "save"> & { map: Pick<Ctx["map"], "id">; ctx: Readonly<{ connection: Pick<Ctx["ctx"]["connection"], "send"> }> }>

/** 会話を始めるときに現在の到達地点で停止し、保存済みの姿にも同じ座標を使う。 */
export async function handleEngage(room: Props, message: Message<"engage">) {
  const me = room.me
  if (!me.player) return
  if (!message.npc) return room.save({ engaged: message.npc })
  const cell = npcCell(room.map, message.npc, timeFor(me))
  if (!cell || !near(me, cell, TALK_CELLS + 1)) return room.ctx.connection.send({ type: "refused", what: "engage" })
  const reached = reachable(me).at(-1)
  if (!reached) return room.ctx.connection.send({ type: "refused", what: "engage" })
  const here: Cell = [reached[0], reached[1]]
  room.save({ engaged: message.npc, route: [here], since: Date.now(), player: { ...me.player, at: here } })
}
