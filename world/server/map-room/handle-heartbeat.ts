import { getMapRefreshPlan } from "#/world/server/map-room/get-map-refresh-plan"
import { refreshMapPlayer } from "#/world/server/map-room/refresh-map-player"
import { refreshMapWild } from "#/world/server/map-room/refresh-map-wild"
import { refreshMapNature } from "#/world/server/map-room/refresh-map-nature"
import type { HeartbeatContext } from "#/world/server/map-room/heartbeat-types"

/** 独立した同期を並行に進め、保存先の失敗は他の配送を終えてから呼出し元へ返す。 */
export async function handleHeartbeat(room: HeartbeatContext): Promise<void> {
  const me = room.me
  const owner = me.owner
  if (!me.player || !owner || me.ready === false || me.closed) return
  const plan = getMapRefreshPlan({ map: room.key.map, me, now: Date.now() })
  if (!plan.delivery && !plan.wild && !plan.nature) return
  room.save(plan.attempts)
  const refreshes = await Promise.allSettled([
    ...(plan.delivery ? [refreshMapPlayer(room, owner)] : []),
    ...(plan.wild ? [refreshMapWild(room)] : []),
    ...(plan.nature ? [refreshMapNature(room)] : []),
  ])
  for (const refresh of refreshes) if (refresh.status === "rejected") throw refresh.reason
}
