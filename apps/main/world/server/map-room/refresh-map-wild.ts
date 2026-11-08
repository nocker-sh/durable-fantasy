import { Wild } from "#/durable-objects/wild"
import { presence } from "#/world/server/map-room/presence"
import { notifyClient } from "#/world/server/map-room/notifications"
import type { HeartbeatContext } from "#/world/server/map-room/heartbeat-types"

/** 復活をブラウザの時刻だけで決めず、保存先が認めた現在の HP と公開順を届ける。 */
export async function refreshMapWild(room: HeartbeatContext): Promise<void> {
  const snapshot = await Wild.get(room.ctx.params.mapId).snapshot(room.key.map)
  if (presence(room.ctx.connection).closed) return
  await notifyClient(room.ctx.connection.send({ type: "wild", ...snapshot }))
}
