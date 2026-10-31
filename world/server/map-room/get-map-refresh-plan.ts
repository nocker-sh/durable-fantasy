import { NODES } from "#/world/core/gather"
import { spawnsOn } from "#/world/core/spawns-on"
import type { Presence } from "#/world/server/map-room/presence"

type Props = Readonly<{ map: string; me: Pick<Presence, "deliveryCheckedAt" | "wildCheckedAt" | "natureCheckedAt">; now: number }>

/** 成功ではなく試行から間隔を測り、存在しない資源や生き物の保存先は読まない。 */
export function getMapRefreshPlan(props: Props) {
  const me = props.me
  const now = props.now
  const delivery = me.deliveryCheckedAt === undefined || now - me.deliveryCheckedAt >= 5000
  const wild = spawnsOn(props.map).length > 0 && (me.wildCheckedAt === undefined || now - me.wildCheckedAt >= 5000)
  const nature = NODES.some((node) => node.map === props.map) && (me.natureCheckedAt === undefined || now - me.natureCheckedAt >= 5000)
  const attempts = { ...(delivery ? { deliveryCheckedAt: now } : {}), ...(wild ? { wildCheckedAt: now } : {}), ...(nature ? { natureCheckedAt: now } : {}) }
  return { delivery, wild, nature, attempts }
}
