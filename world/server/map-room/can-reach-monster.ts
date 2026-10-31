import { monsterAt } from "#/world/core/monster-at"
import { MELEE_REACH } from "#/world/core/monsters"
import { walkable } from "#/world/maps/walkable"
import { reachable } from "#/world/server/map-room/reachable"
import type { Ctx } from "#/world/server/map-room/context"
import type { Spawn } from "#/world/core/monster-types"

/** 保存を待った後の到達範囲と、受付時刻の生き物の位置を照合する。 */
export function canReachMonster(room: Pick<Ctx, "map" | "me">, spawn: Spawn, now: number): boolean {
  const at = monsterAt(spawn, now, (x, z) => walkable(room.map, [Math.floor(x * 2), Math.floor(z * 2)]))
  return reachable(room.me).some((cell) => Math.hypot((cell[0] + 0.5) / 2 - at.x, (cell[1] + 0.5) / 2 - at.z) <= MELEE_REACH + 0.8)
}
