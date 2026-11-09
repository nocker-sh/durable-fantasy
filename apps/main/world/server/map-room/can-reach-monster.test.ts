import { expect, it, vi } from "vitest"
import { canReachMonster } from "#/world/server/map-room/can-reach-monster"
import { MonsterMotion } from "#/world/core/monster-motion"
import { MELEE_REACH, SPAWNS } from "#/world/core/monsters"
import { mapPlayer } from "#/world/server/map-room/map-player"
import { player } from "#/world/test/player"
import type { Cell } from "#/world/scene/runtime/types"

vi.mock("#/world/maps/walkable", () => ({ walkable: () => true }))

it("accepts blows at the same frozen position the renderer uses and rejects distant blows", () => {
  const spawn = SPAWNS[0]
  const motion = new MonsterMotion({ spawn, free: () => true })
  const first = motion.at(1000)
  const cell: Cell = [Math.floor(first.x * 2), Math.floor(first.z * 2)]
  const room = { map: { size: 1, rows: ["."] }, me: { owner: "hunter", player: mapPlayer("hunter", player(), cell), route: [cell], since: 0, said: [], engaged: null } }
  const combat = { at: 1000, until: 3000000 }
  const later = Array.from({ length: 2000 }, (_, index) => 1000 + index * 1000).find((now) => {
    const at = motion.at(now)
    return Math.hypot(at.x - first.x, at.z - first.z) > 4
  })!
  expect(later).toBeDefined()
  expect(canReachMonster(room, spawn, { now: later, combat, reach: MELEE_REACH })).toBe(true)
  expect(canReachMonster(room, spawn, { now: later, reach: MELEE_REACH })).toBe(false)
  expect(canReachMonster(room, spawn, { now: later, combat: { at: 1000, until: later }, reach: MELEE_REACH })).toBe(false)
  const far: Cell = [0, 0]
  expect(canReachMonster({ ...room, me: { ...room.me, player: mapPlayer("hunter", player(), far), route: [far] } }, spawn, { now: later, combat, reach: MELEE_REACH })).toBe(false)
})

it("lets a bow strike from further off than a blade", () => {
  const spawn = SPAWNS[0]
  const motion = new MonsterMotion({ spawn, free: () => true })
  const at = motion.at(1000)
  // three world units off: out of a blade's reach, within a short bow's
  const cell: Cell = [Math.floor((at.x + 3) * 2), Math.floor(at.z * 2)]
  const room = { map: { size: 1, rows: ["."] }, me: { owner: "hunter", player: mapPlayer("hunter", player(), cell), route: [cell], since: 0, said: [], engaged: null } }
  const combat = { at: 1000, until: 3000000 }
  expect(canReachMonster(room, spawn, { now: 1000, combat, reach: MELEE_REACH })).toBe(false)
  expect(canReachMonster(room, spawn, { now: 1000, combat, reach: 4 })).toBe(true)
})
