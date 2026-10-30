import { getMonsterMotionHash } from "#/world/core/get-monster-motion-hash"
import { getMonsterFallbackHome } from "#/world/core/get-monster-fallback-home"
import { MONSTER_NAV_CELLS_PER_TILE } from "#/world/core/monster-motion-rules"
import type { Spawn } from "#/world/core/monster-types"

/** 地形の通行判定を満たす、領域内の休憩の基点を決める。 */
export function getMonsterHome(spawn: Spawn, stay: number, free: (x: number, z: number) => boolean): [number, number] {
  for (const attempt of Array.from({ length: 6 }, (_, index) => index)) {
    const x = spawn.area[0] + getMonsterMotionHash(spawn.id, stay * 7 + attempt) * (spawn.area[2] - spawn.area[0])
    const z = spawn.area[1] + getMonsterMotionHash(spawn.id, stay * 7 + attempt + 3) * (spawn.area[3] - spawn.area[1])
    if (free(x, z)) return [x, z]
  }
  const fallback = getMonsterFallbackHome({ area: spawn.area, free, cellsPerTile: MONSTER_NAV_CELLS_PER_TILE })
  if (fallback instanceof Error) throw fallback
  return fallback
}
