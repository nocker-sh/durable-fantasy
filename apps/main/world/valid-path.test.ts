import { expect, it, vi } from "vitest"
import { validPath } from "#/world/valid-path"

it("rejects an empty new path before asking about terrain", () => {
  const walkable = vi.fn(() => true)
  expect(validPath([[0, 0]], [], walkable)).toBe(false)
  expect(walkable).not.toHaveBeenCalled()
})

it("requires a reachable starting cell and adjacent steps on walkable terrain", () => {
  expect(
    validPath(
      [[0, 0]],
      [
        [1, 0],
        [2, 0],
      ],
      () => true,
    ),
  ).toBe(true)
  expect(validPath([], [[0, 0]], () => true)).toBe(false)
  expect(validPath([[0, 0]], [[3, 0]], () => true)).toBe(false)
  expect(
    validPath(
      [[0, 0]],
      [
        [1, 0],
        [3, 0],
      ],
      () => true,
    ),
  ).toBe(false)
  expect(
    validPath(
      [[0, 0]],
      [
        [1, 0],
        [2, 0],
      ],
      (cell) => cell[0] !== 2,
    ),
  ).toBe(false)
})
