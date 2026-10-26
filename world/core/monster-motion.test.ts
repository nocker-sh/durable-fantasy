import { expect, it, vi } from "vitest"
import { SPAWNS, MonsterMotion, monsterAt } from "./monsters"
import { MAPS, walkable } from "../maps"

it("matches authoritative positions across movement, resting and clock jumps", () => {
  for (const spawn of SPAWNS) {
    const free = (x: number, z: number) => walkable(MAPS[spawn.map], [Math.floor(x * 2), Math.floor(z * 2)])
    const motion = new MonsterMotion(spawn, free)
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
  const motion = new MonsterMotion(spawn, free)
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
