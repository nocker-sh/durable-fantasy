import { cellsReached } from "#/world/cells-reached"
import { paceTo } from "#/world/server/map-room/pace-to"
import type { Presence } from "#/world/server/map-room/presence"

type Fallen = Pick<Presence, "down"> & Partial<Pick<Presence, "route" | "since" | "paced">>

/** 戦闘不能は位置がなくても反映する。停止地点は到達範囲から写し、存在しない座標を保存しない。 */
export function getFallenPresence(me: Pick<Presence, "route" | "since" | "paced">, now: number): Fallen {
  const at = cellsReached(me.route, (now - me.since) / 1000).at(-1)
  if (!at) return { down: true }
  const here: [number, number] = [at[0], at[1]]
  return { down: true, route: [here], since: now, paced: paceTo(me, here, now) }
}
