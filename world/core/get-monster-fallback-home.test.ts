import { expect, it } from "vitest"
import { getMonsterFallbackHome } from "#/world/core/get-monster-fallback-home"

it("rejects an oversized resting search before any terrain query", () => {
  const queries = { count: 0 }
  expect(
    getMonsterFallbackHome({
      area: [0, 0, 32768, 0],
      cellsPerTile: 2,
      free: () => {
        queries.count += 1
        return false
      },
    }),
  ).toEqual(new Error("Monster navigation grid exceeds allocation budget"))
  expect(queries.count).toBe(0)
})

it("scans every permitted resting cell in the original row order without snapping the chosen point", () => {
  const visited: [number, number][] = []
  expect(
    getMonsterFallbackHome({
      area: [-0.2, -0.2, 0.2, 0.2],
      cellsPerTile: 2,
      free: (x, z) => {
        visited.push([x, z])
        return x > 0 && z > 0
      },
    }),
  ).toEqual([0.2, 0.2])
  expect(visited).toEqual([
    [-0.2, -0.2],
    [0.2, -0.2],
    [-0.2, 0.2],
    [0.2, 0.2],
  ])
})

it("retains the full rectangular search boundary and rejects invalid scale before terrain", () => {
  const queries = { count: 0 },
    free = () => {
      queries.count += 1
      return false
    }
  expect(getMonsterFallbackHome({ area: [0, 0, 32767.5, 0], cellsPerTile: 2, free })).toEqual(new Error("Monster territory has no walkable resting point"))
  expect(queries.count).toBe(65536)
  queries.count = 0
  expect(getMonsterFallbackHome({ area: [0, 0, 1, 1], cellsPerTile: 0, free })).toEqual(new Error("Invalid monster grid territory or scale"))
  expect(queries.count).toBe(0)
})
