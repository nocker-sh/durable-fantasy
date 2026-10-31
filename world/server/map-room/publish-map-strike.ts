import { notifyClient } from "#/world/server/map-room/notifications"
import { notifyMapStrike } from "#/world/server/map-room/notify-map-strike"
import { deliverMapStrike } from "#/world/server/map-room/deliver-map-strike"
import type { MapStrikePublication } from "#/world/server/map-room/attack-types"

/** 保存済みの支払を先に通知し、拒否されなかった命中だけ公開して配送を続ける。 */
export async function publishMapStrike(props: MapStrikePublication): Promise<void> {
  const result = props.result
  const connection = props.room.ctx.connection
  if (result.payment) await notifyClient(connection.send({ type: "result", seq: -1, result: result.payment }))
  if (result.refused) {
    await notifyClient(
      connection.send({ type: "refused", what: props.message.art && result.payment && !result.payment.ok ? "art" : "attack", monster: props.attack.spawn.id, reason: result.reason ?? "TAKEN" }),
    )
    return
  }
  props.room.save({ struck: props.attack.now })
  await notifyMapStrike(props.room, props.attack, result)
  await deliverMapStrike(props)
}
