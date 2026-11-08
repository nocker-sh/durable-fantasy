import { expect, it } from "vitest"
import { toHeadingLocalCuboid } from "#/world/scene/to-heading-local-cuboid"
const box = { x0: 11, x1: 12, bottom: 2, top: 3, z0: 23, z1: 25 }
it("rotates a translated solid into the native frame without losing its height or opposite corners", () => {
  const local = toHeadingLocalCuboid({ box, root: [10, 1, 20], heading: Math.PI / 2 })
  if (local instanceof Error) throw local
  expect(local.x0).toBeCloseTo(-5, 12)
  expect(local.x1).toBeCloseTo(-3, 12)
  expect(local.z0).toBeCloseTo(1, 12)
  expect(local.z1).toBeCloseTo(2, 12)
  expect(local.bottom).toBe(1)
  expect(local.top).toBe(2)
})
it("refuses flat solids and invalid transforms", () => {
  expect(toHeadingLocalCuboid({ box: { ...box, top: box.bottom }, root: [0, 0, 0], heading: 0 })).toBeInstanceOf(Error)
  expect(toHeadingLocalCuboid({ box, root: [0, NaN, 0], heading: 0 })).toBeInstanceOf(Error)
})
