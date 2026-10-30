import type { Vector2Tuple } from "#/lib/engine/vector2-types"
import { expect, it } from "vitest"
import { SPAWNS, MONSTER_KINDS } from "#/world/core/monsters"
import { MAPS } from "#/world/maps"
import { walkable } from "#/world/maps/walkable"
import { getMonsterBodyRadius } from "#/world/core/get-monster-body-radius"
import { createMonsterNavigationFree } from "#/world/core/create-monster-navigation-free"
import { getMonsterSegmentError } from "#/world/core/get-monster-segment-error"
import { MONSTER_NAV_CELLS_PER_TILE } from "#/world/core/monster-motion-rules"
const territories = [...new Map(SPAWNS.map((spawn) => [`${spawn.map}:${spawn.kind}:${spawn.area}`, spawn])).values()]
it.each(territories)("keeps $id's body-aware grid connected with every allowed edge clear", (spawn) => {
  const radius = getMonsterBodyRadius({ kind: MONSTER_KINDS[spawn.kind] })
  if (radius instanceof Error) throw radius
  const free = (x: number, z: number) => walkable(MAPS[spawn.map], [Math.floor(x * 2), Math.floor(z * 2)])
  const navigationFree = createMonsterNavigationFree({ area: spawn.area, radius, free }),
    scale = MONSTER_NAV_CELLS_PER_TILE
  const width = Math.floor(spawn.area[2] * scale) - Math.floor(spawn.area[0] * scale) + 1,
    depth = Math.floor(spawn.area[3] * scale) - Math.floor(spawn.area[1] * scale) + 1
  const nodes = new Map<string, Vector2Tuple>()
  for (const index of Array.from({ length: width * depth }).keys()) {
    const x = index % width,
      z = Math.floor(index / width)
    const point: Vector2Tuple = [Math.min(spawn.area[2], spawn.area[0] + (x + 0.5) / scale), Math.min(spawn.area[3], spawn.area[1] + (z + 0.5) / scale)]
    if (navigationFree(...point)) nodes.set(`${x},${z}`, point)
  }
  expect(nodes.size).toBeGreaterThan(0)
  const offsets: ReadonlyArray<readonly [number, number]> = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ]
  for (const entry of nodes) {
    const cell = entry[0].split(",").map(Number)
    for (const offset of offsets) {
      const target = nodes.get(`${cell[0] + offset[0]},${cell[1] + offset[1]}`)
      if (!target) continue
      if (offset[0] !== 0 && offset[1] !== 0 && (!nodes.has(`${cell[0] + offset[0]},${cell[1]}`) || !nodes.has(`${cell[0]},${cell[1] + offset[1]}`))) continue
      expect(getMonsterSegmentError({ from: entry[1], to: target, radius, free })).toBeNull()
    }
  }
  const first = nodes.keys().next().value!,
    pending = [first],
    visited = new Set([first])
  while (pending.length) {
    const cell = pending.pop()!.split(",").map(Number)
    for (const offset of offsets.slice(0, 4)) {
      const target = `${cell[0] + offset[0]},${cell[1] + offset[1]}`
      if (nodes.has(target) && !visited.has(target)) {
        visited.add(target)
        pending.push(target)
      }
    }
  }
  expect(visited.size).toBe(nodes.size)
})
