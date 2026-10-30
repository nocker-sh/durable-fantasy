import { expect, it } from "vitest"
import { limbSd } from "#/lib/graphics/ray/limb-sd"
import { canSeparateLimbFromCuboid } from "#/lib/graphics/ray/can-separate-limb-from-cuboid"
const surface = limbSd(
  [
    [-0.1, 0, 0],
    [0.1, 0, 0],
  ],
  [0.04, 0.04],
)
const box = { x0: -0.01, x1: 0.01, bottom: 0.09, top: 0.11, z0: -0.01, z1: 0.01 }

it("keeps a real limb field separate only when the full displacement enclosure also clears", () => {
  expect(canSeparateLimbFromCuboid({ surface, box, margin: 0 })).toBe(true)
  expect(canSeparateLimbFromCuboid({ surface, box, margin: 0.1 })).toBe(false)
  const penetrating = { ...box, bottom: -0.01, top: 0.01 }
  expect(surface.sd([0, 0, 0])).toBeLessThan(0)
  expect(canSeparateLimbFromCuboid({ surface, box: penetrating, margin: 0 })).toBe(false)
})

it("rejects malformed bounds, invalid margins and nonfinite native surfaces", () => {
  for (const margin of [-1, NaN, Infinity]) expect(canSeparateLimbFromCuboid({ surface, box, margin })).toBe(false)
  expect(canSeparateLimbFromCuboid({ surface, box: { ...box, x1: box.x0 }, margin: 1 })).toBe(false)
  const broken = limbSd(
    [
      [NaN, 0, 0],
      [0.1, 0, 0],
    ],
    [0.04, 0.04],
  )
  expect(canSeparateLimbFromCuboid({ surface: broken, box, margin: 0 })).toBe(false)
})
