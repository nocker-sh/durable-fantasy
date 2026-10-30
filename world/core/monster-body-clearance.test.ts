import { it } from "vitest"
import { MONSTER_KINDS, SPAWNS } from "#/world/core/monsters"
import { MonsterMotion } from "#/world/core/monster-motion"
import { getMonsterBodyRadius } from "#/world/core/get-monster-body-radius"
import { getMonsterSegmentError } from "#/world/core/get-monster-segment-error"
import { MAPS } from "#/world/maps"
import { walkable } from "#/world/maps/walkable"
it.each(SPAWNS)("keeps $id's entire body clear through a full day's clock", (spawn) => {
  const free = (x: number, z: number) => walkable(MAPS[spawn.map], [Math.floor(x * 2), Math.floor(z * 2)])
  const radius = getMonsterBodyRadius({ kind: MONSTER_KINDS[spawn.kind] })
  if (radius instanceof Error) throw radius
  const motion = new MonsterMotion({ spawn: spawn, free: free })
  for (const index of Array.from({ length: Math.ceil(86400000 / 7311) + 1 }).keys()) {
    const time = Math.min(86400000, index * 7311),
      position = motion.at(time)
    const error = getMonsterSegmentError({ from: [position.x, position.z], to: [position.x, position.z], radius, free })
    if (error) throw new Error(`${spawn.id} intersects blocked ground at ${time}: ${error.message}`)
    if (position.x < spawn.area[0] || position.x > spawn.area[2] || position.z < spawn.area[1] || position.z > spawn.area[3]) throw new Error(`${spawn.id} left its original territory`)
  }
})
