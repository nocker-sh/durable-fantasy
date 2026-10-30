import { expect, it, vi } from "vitest"
import { getSweptGridClearanceFailure } from "./get-swept-grid-clearance-failure"

it("returns ordinary blocked-candidate reasons while preserving the swept footprint between clear endpoints", () => {
  const isCellFree = (cell: readonly [number, number]) => cell[0] !== 3 || cell[1] !== 2
  expect(getSweptGridClearanceFailure({ from: [0.75, 0.75], to: [0.75, 0.75], radius: 0.27, cellSize: 0.5, isCellFree })).toBeNull()
  expect(getSweptGridClearanceFailure({ from: [2.75, 0.75], to: [2.75, 0.75], radius: 0.27, cellSize: 0.5, isCellFree })).toBeNull()
  expect(getSweptGridClearanceFailure({ from: [0.75, 0.75], to: [2.75, 0.75], radius: 0.27, cellSize: 0.5, isCellFree })).toBe("Moving footprint intersects a blocked grid cell")
  expect(getSweptGridClearanceFailure({ from: [0.75, 0.75], to: [2.75, 0.75], radius: 0.25, cellSize: 0.5, isCellFree })).toBeNull()
})

it("rejects malformed and unbounded searches before querying terrain", () => {
  const isCellFree = vi.fn(() => true)
  for (const radius of [0, -1, NaN, Infinity]) expect(getSweptGridClearanceFailure({ from: [0, 0], to: [1, 1], radius, cellSize: 0.5, isCellFree })).toBe("Invalid moving footprint")
  expect(getSweptGridClearanceFailure({ from: [NaN, 0], to: [1, 1], radius: 0.4, cellSize: 0.5, isCellFree })).toBe("Invalid moving footprint")
  expect(getSweptGridClearanceFailure({ from: [0, 0], to: [1, 1], radius: 0.4, cellSize: 0, isCellFree })).toBe("Invalid moving footprint")
  expect(getSweptGridClearanceFailure({ from: [0, 0], to: [1e9, 1e9], radius: 0.4, cellSize: 0.5, isCellFree })).toBe("Moving footprint exceeds traversal budget")
  expect(isCellFree).not.toHaveBeenCalled()
})

it("keeps terrain failures exceptional instead of treating them as an ordinary blocked candidate", () => {
  const failure = new Error("Terrain unavailable")
  expect(() =>
    getSweptGridClearanceFailure({
      from: [0, 0],
      to: [1, 1],
      radius: 0.4,
      cellSize: 0.5,
      isCellFree: () => {
        throw failure
      },
    }),
  ).toThrow(failure)
})

it("keeps row-major terrain reads and stops at the first intersecting cell", () => {
  const visits: ReadonlyArray<number>[] = []
  const query = { from: [-0.25, -0.25], to: [0.75, 0.75], radius: 0.25, cellSize: 0.5 } as const
  const isCellFree = (cell: readonly [number, number]) => {
    visits.push([...cell])
    return cell[0] !== 0 || cell[1] !== 0
  }
  expect(getSweptGridClearanceFailure({ ...query, isCellFree })).toBe("Moving footprint intersects a blocked grid cell")
  expect(visits).toEqual([
    [-1, -1],
    [0, -1],
    [1, -1],
    [2, -1],
    [-1, 0],
    [0, 0],
  ])
})

it("accepts the exact traversal budget but refuses an extra column before querying terrain", () => {
  const failure = new Error("Terrain was reached")
  const isCellFree = vi.fn(() => {
    throw failure
  })
  const query = { from: [0.5, 0.5], to: [255.5, 255.5], radius: 0.25, cellSize: 1 } as const
  expect(() => getSweptGridClearanceFailure({ ...query, isCellFree })).toThrow(failure)
  expect(getSweptGridClearanceFailure({ ...query, to: [256.5, 255.5], isCellFree })).toBe("Moving footprint exceeds traversal budget")
  expect(isCellFree).toHaveBeenCalledOnce()
})

it("provides distinct stable cells to callbacks and terminates at the largest safe coordinate", () => {
  const visits: (readonly [number, number])[] = []
  const isCellFree = (cell: readonly [number, number]) => {
    visits.push(cell)
    return true
  }
  expect(getSweptGridClearanceFailure({ from: [0.5, 0.5], to: [1.5, 1.5], radius: 0.25, cellSize: 1, isCellFree })).toBeNull()
  expect(visits).toEqual([
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1],
  ])
  expect(new Set(visits).size).toBe(4)
  visits.length = 0
  const edge = Number.MAX_SAFE_INTEGER
  expect(getSweptGridClearanceFailure({ from: [edge, edge], to: [edge, edge], radius: 0.1, cellSize: 1, isCellFree })).toBeNull()
  expect(visits).toEqual([[edge, edge]])
  visits.length = 0
  expect(getSweptGridClearanceFailure({ from: [0, 0], to: [0, 0], radius: Number.MIN_VALUE, cellSize: Number.MAX_VALUE, isCellFree })).toBeNull()
  expect(visits).toEqual([[0, 0]])
})
