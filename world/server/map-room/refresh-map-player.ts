import { Player } from "#/durable-objects/player"
import { presence } from "#/world/server/map-room/presence"
import { getFallenPresence } from "#/world/server/map-room/get-fallen-presence"
import { notifyClient } from "#/world/server/map-room/notifications"
import type { HeartbeatContext } from "#/world/server/map-room/heartbeat-types"

/** 姿勢と戦闘不能は通知より先に保存し、失われた通知の公開番号は次回へ残す。 */
export async function refreshMapPlayer(room: HeartbeatContext, owner: string): Promise<void> {
  const me = room.me
  const delivery = await Player.get(owner).deliveryUpdate(me.deliveryRevision ?? null)
  if (presence(room.ctx.connection).closed) return
  if (delivery.player) {
    room.save({ sitting: delivery.player.sitting })
    if (delivery.player.hp <= 0) room.save(getFallenPresence(me, Date.now()))
    const delivered = await notifyClient(room.ctx.connection.send({ type: "result", seq: -1, result: { ok: true, state: delivery.player, events: [] } }))
    if (!delivered) return
  }
  room.save({ deliveryRevision: delivery.revision })
}
