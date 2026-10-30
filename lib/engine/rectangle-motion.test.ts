import { expect, it } from "vitest"
import { rectangleTranslationBounds } from "./rectangle-translation-bounds"
import { rectangleTranslationHits } from "./rectangle-translation-hits"
import { rectangleTurnRadius } from "./rectangle-turn-radius"
it("tests the whole translation and does not confuse a diagonal's bounding box with its sweep", () => {
  const load = [-0.1, -0.1, 0.1, 0.1] as const
  expect(rectangleTranslationHits({ relative: load, from: [0, 0], to: [4, 4], obstacle: [1.95, 1.95, 2.05, 2.05] })).toBe(true)
  expect(rectangleTranslationHits({ relative: load, from: [4, 4], to: [0, 0], obstacle: [1.95, 1.95, 2.05, 2.05] })).toBe(true)
  expect(rectangleTranslationHits({ relative: load, from: [0, 0], to: [4, 4], obstacle: [0, 3, 1, 4] })).toBe(false)
  expect(rectangleTranslationBounds(load, [0, 0], [4, 4])).toEqual([-0.1, -0.1, 4.1, 4.1])
  expect(rectangleTranslationHits({ relative: [1, -0.1, 2, 0.1], from: [0, 0], to: [0, 3], obstacle: [1.2, 1.4, 1.4, 1.6] })).toBe(true)
})
it("retains explicit touching and tolerance policies", () => {
  const load = [-0.5, -0.5, 0.5, 0.5] as const,
    wall = [2, 1, 3, 2] as const
  expect(rectangleTranslationHits({ relative: load, from: [0, 0.5], to: [4, 0.5], obstacle: wall })).toBe(true)
  expect(rectangleTranslationHits({ relative: load, from: [0, 0.5], to: [4, 0.5], obstacle: wall, tolerance: 0, boundary: "open" })).toBe(false)
  expect(rectangleTranslationHits({ relative: load, from: [0, 0.5], to: [4, 0.5], obstacle: wall, tolerance: 0.01 })).toBe(false)
  expect(rectangleTranslationHits({ relative: load, from: [0, 0.51], to: [4, 0.51], obstacle: wall, tolerance: 0.01, boundary: "open" })).toBe(false)
  expect(rectangleTranslationHits({ relative: load, from: [0, 0.51], to: [4, 0.51], obstacle: wall, tolerance: 0.01, boundary: "closed" })).toBe(true)
})
it("matches continuous axis-aligned envelope overlap in both travel directions", () => {
  const relative = [-0.5, -1, 0.5, 1] as const
  for (const [a, b] of [
    [
      [2, 2],
      [2, 6],
    ],
    [
      [2, 6],
      [2, 2],
    ],
    [
      [2, 2],
      [6, 2],
    ],
    [
      [6, 2],
      [2, 2],
    ],
  ] as const) {
    const sweep = rectangleTranslationBounds(relative, a, b)
    for (let x = 0; x < 8; x += 0.5)
      for (let z = 0; z < 8; z += 0.5) {
        const wall = [x, z, x + 0.5, z + 0.5] as const
        const overlap = sweep[0] < wall[2] && sweep[2] > wall[0] && sweep[1] < wall[3] && sweep[3] > wall[1]
        expect(rectangleTranslationHits({ relative: relative, from: a, to: b, obstacle: wall, tolerance: 0, boundary: "open" })).toBe(overlap)
      }
  }
  expect(rectangleTurnRadius([-1, -2, 1, 2])).toBeCloseTo(Math.sqrt(5))
  expect(rectangleTurnRadius([2, 0, 3, 1])).toBeCloseTo(Math.sqrt(10))
})
