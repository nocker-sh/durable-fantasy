import { Nature } from "#/durable-objects/nature"
import { presence } from "#/world/server/map-room/presence"
import { notifyClient } from "#/world/server/map-room/notifications"
import type { HeartbeatContext } from "#/world/server/map-room/heartbeat-types"

/** 確定や返却後の残量を読み、切断済みの接続や空の結果には通知しない。 */
export async function refreshMapNature(room: HeartbeatContext): Promise<void> {
  const left = await Nature.get(`town-${room.key.world}`).left(room.key.map)
  if (presence(room.ctx.connection).closed || !Object.keys(left).length) return
  await notifyClient(room.ctx.connection.send({ type: "nodes", left }))
}
