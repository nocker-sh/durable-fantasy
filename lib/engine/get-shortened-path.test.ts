import { expect, it, vi } from "vitest"
import { getShortenedPath } from "#/lib/engine/get-shortened-path"

it("keeps the farthest clear turn without requiring intermediate shortcuts to be clear", () => {
  const points = Object.freeze([0, 1, 2, 3, 4])
  const isVisible = vi.fn((from: number, to: number) => from === 0 && to === 3)
  expect(getShortenedPath({ points, isVisible })).toEqual([0, 3, 4])
  expect(isVisible.mock.calls).toEqual([
    [0, 4],
    [0, 3],
  ])
  expect(points).toEqual([0, 1, 2, 3, 4])
  expect(getShortenedPath({ points, isVisible: (from, to) => from === 0 && to === 4 })).toEqual([0, 4])
})

it("preserves all adjacent steps on a long winding route", () => {
  const points = Array.from({ length: 2000 }, (_, index) => index)
  expect(getShortenedPath({ points, isVisible: () => false })).toEqual(points)
})

it("preserves waypoint references and does not query visibility for empty, single or adjacent paths", () => {
  const start = { x: 0, y: 0 }
  const end = { x: 1, y: 1 }
  const isVisible = vi.fn(() => false)
  expect(getShortenedPath({ points: [], isVisible })).toEqual([])
  expect(getShortenedPath({ points: [start], isVisible })[0]).toBe(start)
  const shortened = getShortenedPath({ points: [start, end], isVisible })
  expect(shortened[0]).toBe(start)
  expect(shortened[1]).toBe(end)
  expect(isVisible).not.toHaveBeenCalled()
})
