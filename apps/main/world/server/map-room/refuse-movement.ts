import { Player } from "#/durable-objects/player"
import { reachable } from "#/world/server/map-room/reachable"
import type { MovementRequestContext } from "#/world/server/map-room/movement-request-types"

type Props = Pick<MovementRequestContext, "me" | "save" | "ctx">

/** 拒否した経路は現在の到達地点へ補正し、保存先の受理後だけ周囲へ停止を通知する。 */
export async function refuseMovement(room: Props) {
  const me = room.me
  if (!me.player) return
  const connection = room.ctx.connection
  const at = reachable(me)[0]
  if (!at) return connection.send({ type: "refused", what: "move" })
  if (me.owner && (await Player.get(me.owner).walk({ connection: connection.id, route: [at] }))) {
    room.save({ player: { ...me.player, at }, route: [at], since: Date.now() })
    await room.ctx.room.broadcast({ type: "moved", id: me.player.id, path: [at] }, [connection.id])
  }
  await connection.send({ type: "refused", what: "move", at })
}
