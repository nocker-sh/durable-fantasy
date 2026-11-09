import { expect, it } from "vitest"
import { getInteriorEntrance } from "#/world/town/get-interior-entrance"
import type { Cell } from "#/world/town/interiors"

const cases: readonly { point: Cell; outward: Cell; door: Cell; arrive: Cell }[] = [
  { point: [2, 0], outward: [0, -1], door: [26, 40], arrive: [26, 42] },
  { point: [2, 10], outward: [0, 1], door: [26, 69], arrive: [26, 67] },
  { point: [0, 2], outward: [-1, 0], door: [20, 46], arrive: [22, 46] },
  { point: [10, 2], outward: [1, 0], door: [49, 46], arrive: [47, 46] },
]
it.each(cases)("keeps the collision cell inside the projected entrance: %j", (input) => {
  const source = { point: input.point, outward: input.outward },
    original = structuredClone(source)
  const result = getInteriorEntrance({ entrance: source, door: 2, x0: 10, z0: 20, z1: 35, scale: 1.5 })
  expect(result.entrance?.point).toEqual([10 + input.point[0] * 1.5, 20 + input.point[1] * 1.5])
  expect(result.door).toEqual(input.door)
  expect(result.arrive).toEqual(input.arrive)
  expect(source).toEqual(original)
})
it("preserves the legacy south doorway when no authored entrance exists", () => {
  expect(getInteriorEntrance({ entrance: undefined, door: 2, x0: 10, z0: 20, z1: 35, scale: 1.5 })).toEqual({ entrance: undefined, door: [26, 69], arrive: [26, 67] })
})
