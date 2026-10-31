import { reconcileStrikeNotices } from "#/world/server/map-room/reconcile-strike-notices"
import { notifyCombat } from "#/world/server/map-room/notify-combat"
import { notifyClient } from "#/world/server/map-room/notifications"
import { getFallenPresence } from "#/world/server/map-room/get-fallen-presence"
import type { MapStrikePublication } from "#/world/server/map-room/attack-types"

/** 保存済みの配送を照合してから反撃を知らせ、通知の失敗でも戦闘不能の保存を止めない。 */
export async function deliverMapStrike(props: MapStrikePublication): Promise<void> {
  const notices = await props.wild.deliverStrike(props.attack.owner, props.id)
  const reconciled = await reconcileStrikeNotices(props.attack.owner, notices, props.result)
  await notifyCombat(props.room, reconciled.notices)
  if (!props.result.counter) return
  const down = !!reconciled.own?.ok && reconciled.own.state.hp <= 0
  if (down) props.room.save(getFallenPresence(props.room.me, Date.now()))
  await notifyClient(props.room.ctx.room.broadcast({ type: "hitback", monster: props.attack.spawn.id, target: props.attack.playerId, swing: props.result.counter, down }))
}
