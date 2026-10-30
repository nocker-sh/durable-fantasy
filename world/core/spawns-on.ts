import { SPAWNS } from "#/world/core/monsters"
import type { Spawn } from "#/world/core/monster-types"

const spawnsByMap = new Map<string, readonly Spawn[]>()
const noSpawns: readonly Spawn[] = []
for (const spawn of SPAWNS) {
  const group = spawnsByMap.get(spawn.map) ?? noSpawns
  spawnsByMap.set(spawn.map, [...group, spawn])
}
/** Stable definition order; callers must not change the shared map population. */
export const spawnsOn = (map: string): readonly Spawn[] => spawnsByMap.get(map) ?? noSpawns
