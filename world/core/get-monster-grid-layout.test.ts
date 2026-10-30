import { expect, it } from "vitest"
import { getMonsterGridLayout } from "#/world/core/get-monster-grid-layout"

it("counts the storage shape rather than treating a thin rectangle as a cheap square", () => {
  const grid = { area: [0, 0, 32767.5, 0] satisfies readonly [number, number, number, number], cellsPerTile: 2 }
  expect(getMonsterGridLayout({ ...grid, storage: "rectangle" })).toMatchObject({ width: 65536, depth: 1, count: 65536 })
  expect(getMonsterGridLayout({ ...grid, storage: "square" })).toEqual(new Error("Monster navigation grid exceeds allocation budget"))
})

it("retains negative-origin bounds and point territories", () => {
  expect(getMonsterGridLayout({ area: [-1.2, -0.2, 1.2, 0.2], cellsPerTile: 2, storage: "rectangle" })).toEqual({ ox: -3, oz: -1, width: 6, depth: 2, size: 6, count: 12 })
  expect(getMonsterGridLayout({ area: [1, 1, 1, 1], cellsPerTile: 4, storage: "square" })).toMatchObject({ width: 1, depth: 1, count: 1 })
})

it("rejects invalid scales and every unrepresentable boundary, including a small width at a huge origin", () => {
  for (const cellsPerTile of [0, -1, NaN, Infinity]) expect(getMonsterGridLayout({ area: [0, 0, 1, 1], cellsPerTile, storage: "rectangle" })).toBeInstanceOf(Error)
  expect(getMonsterGridLayout({ area: [1, 0, 0, 1], cellsPerTile: 2, storage: "rectangle" })).toBeInstanceOf(Error)
  expect(getMonsterGridLayout({ area: [4503599627370495, 0, 4503599627370496, 0], cellsPerTile: 2, storage: "rectangle" })).toEqual(new Error("Monster navigation grid exceeds allocation budget"))
})
