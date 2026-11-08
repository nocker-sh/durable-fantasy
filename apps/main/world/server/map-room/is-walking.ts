import { cellsReached } from "#/world/cells-reached"
import type { Presence } from "#/world/server/map-room/presence"

/** 保存された経路の終わりにまだ着いていない可能性があれば歩いている。 */
export function isWalking(me: Pick<Presence, "route" | "since">, now: number): boolean {
  if (me.route.length < 2) return false
  return cellsReached(me.route, (now - me.since) / 1000)[0] !== me.route[me.route.length - 1]
}
