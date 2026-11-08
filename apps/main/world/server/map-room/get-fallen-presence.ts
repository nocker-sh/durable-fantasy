import { cellsReached } from "#/world/cells-reached"
import type { Presence } from "#/world/server/map-room/presence"

type Fallen = Pick<Presence, "down"> & Partial<Pick<Presence, "route" | "since">>

/** 戦闘不能は位置がなくても反映する。停止地点は到達範囲から写し、存在しない座標を保存しない。 */
export function getFallenPresence(me: Pick<Presence, "route" | "since">, now: number): Fallen {
  const at = cellsReached(me.route, (now - me.since) / 1000).at(-1)
  if (!at) return { down: true }
  return { down: true, route: [[at[0], at[1]]], since: now }
}
