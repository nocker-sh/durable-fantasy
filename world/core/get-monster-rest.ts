import { getMonsterMotionHash } from "#/world/core/get-monster-motion-hash"
import { getMonsterHome } from "#/world/core/get-monster-home"
import type { Spawn } from "#/world/core/monster-types"

const SETTLE = 15
/** 同じ滞在区間の基点から短い移動を作り、塞がれた候補なら基点に留まる。 */
export function getMonsterRest(spawn: Spawn, segment: number, free: (x: number, z: number) => boolean): [number, number] {
  const home = getMonsterHome(spawn, Math.floor(segment / SETTLE), free)
  const x = Math.min(spawn.area[2], Math.max(spawn.area[0], home[0] + (getMonsterMotionHash(spawn.id, segment * 11 + 1) - 0.5) * 1.2))
  const z = Math.min(spawn.area[3], Math.max(spawn.area[1], home[1] + (getMonsterMotionHash(spawn.id, segment * 11 + 2) - 0.5) * 1.2))
  return free(x, z) ? [x, z] : home
}
