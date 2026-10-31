import { expect, it } from "vitest"
import { getGridBoundarySide } from "#/scripts/lib/get-grid-boundary-side"

const cases: readonly { point: readonly number[]; outward: readonly number[]; side: "n" | "s" | "w" | "e" }[] = [
  { point: [2, 0], outward: [0, -1], side: "n" },
  { point: [2, 3], outward: [0, 1], side: "s" },
  { point: [0, 1], outward: [-1, 0], side: "w" },
  { point: [4, 1], outward: [1, 0], side: "e" },
  { point: [0, 0], outward: [-1, 0], side: "w" },
]
it.each(cases)("selects the boundary matching its outward direction: $side", (input) => {
  expect(getGridBoundarySide({ point: input.point, outward: input.outward, width: 5, depth: 4 })).toBe(input.side)
})
it.each([
  { point: [0, 1], outward: [0, -1] },
  { point: [1, 1], outward: [-1, 0] },
  { point: [-1, 0], outward: [-1, 0] },
  { point: [0, 0.5], outward: [-1, 0] },
  { point: [], outward: [0, -1] },
])("rejects a nonmatching or invalid boundary cell: %j", (input) => {
  expect(getGridBoundarySide({ ...input, width: 5, depth: 4 })).toBeNull()
})
