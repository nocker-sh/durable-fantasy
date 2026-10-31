import { Player } from "#/durable-objects/player"
import { presence } from "#/world/server/map-room/presence"
import type { JoinRequestContext } from "#/world/server/map-room/join-request-types"
import type { Cell } from "#/world/protocol"

/** 到着の保存中に切断した接続は所有を解放し、別の行先を返された場合はそちらへ通知する。 */
export async function arriveMapPlayer(room: JoinRequestContext, owner: string): Promise<{ at: Cell } | null> {
  const connection = room.ctx.connection
  if (presence(connection).closed) return null
  const arrival = await Player.get(owner).arrive({ world: room.key.world, map: room.key.map, connection: connection.id })
  if (presence(connection).closed) {
    await Player.get(owner).leave(connection.id)
    return null
  }
  if (!arrival.accepted) {
    await connection.send({ type: "warped", map: arrival.map, at: arrival.at })
    return null
  }
  return arrival
}
