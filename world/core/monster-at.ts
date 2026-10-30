import { getMonsterBodyRadius } from "#/world/core/get-monster-body-radius"
import { createMonsterNavigationFree } from "#/world/core/create-monster-navigation-free"
import { MONSTER_MOVE_PERIOD_MS as PERIOD } from "#/world/core/monster-motion-rules"
import { getMonsterRoute } from "#/world/core/get-monster-route"
import { getMonsterRoutePosition } from "#/world/core/get-monster-route-position"
import { MONSTER_KINDS } from "#/world/core/monsters"
import { getMonsterMotionHash } from "#/world/core/get-monster-motion-hash"
import { getMonsterRest } from "#/world/core/get-monster-rest"
import type { Spawn } from "#/world/core/monster-types"

/** 同じ時刻と地形からサーバーと描画で一致する位置を求める。 */
export function monsterAt(spawn: Spawn, time: number, free: (x: number, z: number) => boolean = () => true): { x: number; z: number; moving: boolean } {
  // each has its own beat, so they do not all shuffle at once
  const tt = time + getMonsterMotionHash(spawn.id, 99) * PERIOD
  const seg = Math.floor(tt / PERIOD),
    into = tt - seg * PERIOD
  const radius = getMonsterBodyRadius({ kind: MONSTER_KINDS[spawn.kind] })
  if (radius instanceof Error) throw radius
  const navigationFree = createMonsterNavigationFree({ area: spawn.area, radius, free })
  const a = getMonsterRest(spawn, seg - 1, navigationFree),
    b = getMonsterRest(spawn, seg, navigationFree)
  const route = getMonsterRoute({ from: a, to: b, area: spawn.area, radius, free })
  if (route instanceof Error) throw route
  return getMonsterRoutePosition({ route, into })
}
