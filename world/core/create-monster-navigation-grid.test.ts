import { expect, it, vi } from "vitest"
import { createMonsterNavigationGrid } from "./create-monster-navigation-grid"

it("queries only real cells in row order, retaining negative and clipped coordinates", () => {
  const queries: number[][] = []
  const navigation = createMonsterNavigationGrid({
    area: [-0.25, 1.1, 0.9, 1.4],
    cellsPerTile: 2,
    free: (x, z) => {
      queries.push([x, z])
      return x !== 0.25
    },
  })
  if (navigation instanceof Error) throw navigation
  expect(queries).toEqual([
    [-0.25, 1.25],
    [0.25, 1.25],
    [0.75, 1.25],
  ])
  expect(navigation.layout).toEqual({ ox: -1, oz: 2, width: 3, depth: 1, size: 3, count: 9 })
  expect([...navigation.blocked]).toEqual([0, 1, 0, 1, 1, 1, 1, 1, 1])
})

it("rejects invalid or oversized grids before allocation and terrain queries", () => {
  const free = vi.fn(() => true)
  expect(createMonsterNavigationGrid({ area: [0, 0, 128, 128], cellsPerTile: 2, free })).toEqual(new Error("Monster navigation grid exceeds allocation budget"))
  expect(createMonsterNavigationGrid({ area: [0, 0, Infinity, 1], cellsPerTile: 2, free })).toEqual(new Error("Invalid monster grid territory or scale"))
  expect(createMonsterNavigationGrid({ area: [0, 0, 1, 1], cellsPerTile: 0, free })).toEqual(new Error("Invalid monster grid territory or scale"))
  expect(free).not.toHaveBeenCalled()
})

it("does not cache terrain or share the mutable obstacle buffer between calls", () => {
  const terrain = { isClear: true }
  const free = vi.fn(() => terrain.isClear)
  const first = createMonsterNavigationGrid({ area: [0, 0, 1, 1], cellsPerTile: 1, free })
  terrain.isClear = false
  const second = createMonsterNavigationGrid({ area: [0, 0, 1, 1], cellsPerTile: 1, free })
  if (first instanceof Error || second instanceof Error) throw new Error("Expected valid navigation grids")
  expect([...first.blocked]).toEqual([0, 0, 0, 0])
  expect([...second.blocked]).toEqual([1, 1, 1, 1])
  first.blocked.fill(9)
  expect([...second.blocked]).toEqual([1, 1, 1, 1])
  expect(free).toHaveBeenCalledTimes(8)
})

it("propagates terrain failures immediately without treating them as blocked cells", () => {
  const failure = new Error("terrain unavailable")
  const free = vi.fn(() => {
    throw failure
  })
  try {
    createMonsterNavigationGrid({ area: [0, 0, 1, 1], cellsPerTile: 1, free })
    throw new Error("Expected the terrain failure")
  } catch (error) {
    expect(error).toBe(failure)
  }
  expect(free).toHaveBeenCalledOnce()
})
