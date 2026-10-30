import { expect, it } from "vitest"
import { SPAWNS, MONSTER_KINDS } from "#/world/core/monsters"
import { getMonsterBodyRadius } from "#/world/core/get-monster-body-radius"
import { getMonsterGridRoute } from "#/world/core/get-monster-grid-route"

it("refuses an oversized navigation allocation before querying terrain", () => {
  const queries = { count: 0 }
  expect(
    getMonsterGridRoute({
      from: [0, 0],
      to: [128, 128],
      area: [0, 0, 128, 128],
      radius: 0,
      free: () => {
        queries.count += 1
        return false
      },
    }),
  ).toEqual(new Error("Monster navigation grid exceeds allocation budget"))
  expect(queries.count).toBe(0)
})

it("retains the allocation boundary and rejects nonfinite or unrepresentable grids before allocation", () => {
  const queries = { count: 0 },
    free = () => {
      queries.count += 1
      return false
    }
  expect(getMonsterGridRoute({ from: [0, 0], to: [127.5, 127.5], area: [0, 0, 127.5, 127.5], radius: 0, free })).toEqual(new Error("Monster territory has disconnected resting points"))
  expect(queries.count).toBe(65536)
  queries.count = 0
  expect(getMonsterGridRoute({ from: [0, 0], to: [1, 1], area: [-1e308, -1e308, 1e308, 1e308], radius: 0, free })).toEqual(new Error("Monster navigation grid exceeds allocation budget"))
  expect(getMonsterGridRoute({ from: [0, 0], to: [1, 1], area: [0, 0, Infinity, 1], radius: 0, free })).toEqual(new Error("Invalid monster route territory or endpoint"))
  expect(queries.count).toBe(0)
})

it("keeps every authored territory within the body-aware navigation allocation budget", () => {
  for (const spawn of SPAWNS) {
    const radius = getMonsterBodyRadius({ kind: MONSTER_KINDS[spawn.kind] })
    if (radius instanceof Error) throw radius
    expect(getMonsterGridRoute({ from: [spawn.area[0], spawn.area[1]], to: [spawn.area[2], spawn.area[3]], area: spawn.area, radius, free: () => false })).toEqual(
      new Error("Monster territory has disconnected resting points"),
    )
  }
})
