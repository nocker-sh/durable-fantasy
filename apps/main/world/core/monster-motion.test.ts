import { expect, it, vi } from "vitest"
import { SPAWNS } from "#/world/core/monsters"
import { MonsterMotion } from "#/world/core/monster-motion"
import { monsterAt } from "#/world/core/monster-at"
import { MAPS } from "#/world/maps"
import { walkable } from "#/world/maps/walkable"

it("matches authoritative positions across movement, resting and clock jumps", () => {
  for (const spawn of SPAWNS) {
    const free = (x: number, z: number) => walkable(MAPS[spawn.map], [Math.floor(x * 2), Math.floor(z * 2)])
    const motion = new MonsterMotion({ spawn: spawn, free: free })
    for (const base of [0, 20000, 300000, 86_400_000, -30000, 1000]) {
      for (let offset = -500; offset <= 500; offset += 33) {
        const time = base + offset
        expect(motion.at(time)).toEqual(monsterAt(spawn, time, free))
        expect(motion.at(time + 200)).toEqual(monsterAt(spawn, time + 200, free))
      }
    }
  }
})

it("reuses resting points within a segment, including alternating lookahead requests", () => {
  const free = vi.fn(() => true)
  const spawn = SPAWNS[0]
  const motion = new MonsterMotion({ spawn: spawn, free: free })
  motion.at(0)
  motion.at(200)
  const calls = free.mock.calls.length
  for (let i = 0; i < 1000; i++) {
    motion.at(0)
    motion.at(200)
  }
  expect(free).toHaveBeenCalledTimes(calls)
  // Distant epochs replace old points instead of retaining a session-long history.
  for (let i = 1; i <= 100; i++) motion.at(i * 300000)
  const after = free.mock.calls.length
  expect(motion.at(0)).toEqual(monsterAt(spawn, 0))
  expect(free.mock.calls.length).toBeGreaterThan(after)
})

it.each(SPAWNS.filter((candidate) => candidate.map === "south-meadow"))("keeps $id on clear ground across a full day without narrowing its territory", (spawn) => {
  const free = (x: number, z: number) => walkable(MAPS[spawn.map], [Math.floor(x * 2), Math.floor(z * 2)])
  const motion = new MonsterMotion({ spawn: spawn, free: free })
  for (let time = 0; time < 86400000; time += 7311) {
    const position = motion.at(time)
    if (!free(position.x, position.z)) throw new Error(`${spawn.id} entered a blocked cell at ${time}`)
    if (position.x < spawn.area[0] || position.x > spawn.area[2] || position.z < spawn.area[1] || position.z > spawn.area[3]) throw new Error(`${spawn.id} left its territory at ${time}`)
  }
})

const territories = [...new Map(SPAWNS.map((spawn) => [`${spawn.map}:${spawn.area.join(",")}`, spawn])).values()]
it.each(territories)("keeps all clear cells connected inside $id's full territory", (spawn) => {
  const map = MAPS[spawn.map],
    open = new Set<string>()
  const width = Math.floor(spawn.area[2] * 2) - Math.floor(spawn.area[0] * 2) + 1,
    depth = Math.floor(spawn.area[3] * 2) - Math.floor(spawn.area[1] * 2) + 1
  for (const index of Array.from({ length: width * depth }).keys()) {
    const x = Math.floor(spawn.area[0] * 2) + (index % width),
      z = Math.floor(spawn.area[1] * 2) + Math.floor(index / width)
    if (walkable(map, [x, z])) open.add(`${x},${z}`)
  }
  expect(open.size).toBeGreaterThan(0)
  const first = open.values().next().value!,
    pending = [first],
    visited = new Set([first])
  const neighbours: ReadonlyArray<readonly [number, number]> = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ]
  while (pending.length) {
    const point = pending.pop()!.split(",").map(Number)
    for (const offset of neighbours) {
      const next = `${point[0] + offset[0]},${point[1] + offset[1]}`
      if (open.has(next) && !visited.has(next)) {
        visited.add(next)
        pending.push(next)
      }
    }
  }
  expect(visited.size).toBe(open.size)
})

it("owns its spawn snapshot and does not expose cached positions", () => {
  const area: [number, number, number, number] = [28, 28, 44, 42]
  const spawn = { ...SPAWNS[0], area }
  const props = { spawn, free: () => true }
  const expected = monsterAt(spawn, 300123)
  const motion = new MonsterMotion(props)
  area.fill(999)
  spawn.id = "changed-after-construction"
  props.free = () => false
  expect(motion.at(300123)).toEqual(expected)
  const position = motion.at(300123)
  position.x = -999
  position.z = -999
  expect(motion.at(300123)).toEqual(expected)
  expect(Object.isFrozen(motion)).toBe(true)
})
