import { expect, it, vi } from "vitest"
import { getNearbyFreeGridCell } from "#/lib/engine/get-nearby-free-grid-cell"

it("keeps a free requested cell without searching its neighbors", () => {
  const isFree = vi.fn(() => true)
  expect(getNearbyFreeGridCell({ cell: [2, 3], isFree })).toEqual([2, 3])
  expect(isFree.mock.calls).toEqual([[2, 3]])
})

it("preserves ring and row order even when a later cell is closer in Euclidean distance", () => {
  expect(getNearbyFreeGridCell({ cell: [2, 2], isFree: (x, y) => y === 1 && (x === 1 || x === 2) })).toEqual([1, 1])
  expect(getNearbyFreeGridCell({ cell: [2, 2], isFree: (x, y) => (x === 1 && y === 3) || (x === 0 && y === 0) })).toEqual([1, 3])
})

it("includes the outer search ring without using cells beyond it", () => {
  expect(getNearbyFreeGridCell({ cell: [0, 0], isFree: (x, y) => x === 7 && y === 0 })).toEqual([7, 0])
  expect(getNearbyFreeGridCell({ cell: [0, 0], isFree: (x, y) => x === 8 && y === 0 })).toBeNull()
})

it("reads updated occupancy rather than caching a previously free cell", () => {
  const blocked = new Set<string>()
  const isFree = (x: number, y: number) => !blocked.has(`${x},${y}`)
  expect(getNearbyFreeGridCell({ cell: [2, 2], isFree })).toEqual([2, 2])
  blocked.add("2,2")
  expect(getNearbyFreeGridCell({ cell: [2, 2], isFree })).toEqual([1, 1])
})
