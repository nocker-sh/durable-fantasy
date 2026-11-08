import { Player } from "#/durable-objects/player"
import { cellsReached } from "#/world/cells-reached"
import { validPath } from "#/world/valid-path"
import { walkable } from "#/world/maps/walkable"
import { reachable } from "#/world/server/map-room/reachable"
import { refuseMovement } from "#/world/server/map-room/refuse-movement"
import type { Message } from "#/world/server/map-room/context"
import type { MovementRequestContext } from "#/world/server/map-room/movement-request-types"

/** 保存を待つ時間を移動の開始へ足さず、受信した時刻から次の経路へ接続する。 */
export async function handleMove(room: MovementRequestContext, message: Message<"move">) {
  const me = room.me
  if (!me.player) return
  const since = room.receivedAt ?? Date.now()
  const reached = cellsReached(me.route, Math.max(0, since - me.since) / 1000)
  if (me.engaged || me.down || me.trade?.open || !validPath(reached, message.path, (cell) => walkable(room.map, cell))) return refuseMovement(room)
  if (!(await room.standUp())) return room.ctx.connection.send({ type: "refused", what: "move", at: reachable(me)[0] })
  if (!me.owner || !(await Player.get(me.owner).walk({ connection: room.ctx.connection.id, route: message.path, since }))) return
  const at = message.path[message.path.length - 1]
  room.save({ player: { ...me.player, at }, route: message.path, since })
  await room.ctx.room.broadcast({ type: "moved", id: me.player.id, path: message.path }, [room.ctx.connection.id])
}
