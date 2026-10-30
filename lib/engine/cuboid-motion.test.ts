import { expect, it } from "vitest"
import { cuboidTranslationHits } from "./cuboid-translation-hits"
import { translatedCuboid } from "./translated-cuboid"
const shape = { x0: -0.1, z0: -0.1, x1: 0.1, z1: 0.1, bottom: -0.1, top: 0.1 }
it("detects a collision between endpoints and permits a clear diagonal past a box", () => {
  const obstacle = { x0: 1.9, z0: 1.9, x1: 2.1, z1: 2.1, bottom: 1.9, top: 2.1 }
  expect(cuboidTranslationHits({ relative: shape, from: [0, 0, 0], to: [4, 4, 4], obstacle: obstacle })).toBe(true)
  expect(cuboidTranslationHits({ relative: shape, from: [4, 4, 4], to: [0, 0, 0], obstacle: obstacle })).toBe(true)
  expect(cuboidTranslationHits({ relative: shape, from: [0, 0, 0], to: [4, 4, 4], obstacle: { ...obstacle, x0: 0, x1: 1 } })).toBe(false)
})
it("keeps touching faces and stationary nonintersecting boxes separate", () => {
  const obstacle = { x0: 1, z0: 1, x1: 2, z1: 2, bottom: 0, top: 1 }
  expect(cuboidTranslationHits({ relative: shape, from: [1.5, 1.1, 1.5], to: [1.5, 1.1, 1.5], obstacle: obstacle })).toBe(false)
  expect(cuboidTranslationHits({ relative: shape, from: [1.5, 1, 1.5], to: [1.5, 1, 1.5], obstacle: obstacle })).toBe(true)
  expect(translatedCuboid(shape, [1, 2, 3])).toEqual({ x0: 0.9, z0: 2.9, x1: 1.1, z1: 3.1, bottom: 1.9, top: 2.1 })
})

it("keeps all six stationary contacts separate and retains the caller's tolerance", () => {
  const unit = { x0: -1, x1: 1, bottom: -1, top: 1, z0: -1, z1: 1 }
  const contacts: readonly (readonly [number, number, number])[] = [
    [-2, 0, 0],
    [2, 0, 0],
    [0, -2, 0],
    [0, 2, 0],
    [0, 0, -2],
    [0, 0, 2],
  ]
  for (const point of contacts) {
    expect(cuboidTranslationHits({ relative: unit, from: point, to: point, obstacle: unit })).toBe(false)
    const inside: readonly [number, number, number] = [point[0] * 0.99, point[1] * 0.99, point[2] * 0.99]
    expect(cuboidTranslationHits({ relative: unit, from: inside, to: inside, obstacle: unit })).toBe(true)
    expect(cuboidTranslationHits({ relative: unit, from: inside, to: inside, obstacle: unit, tolerance: 0.1 })).toBe(false)
  }
})
