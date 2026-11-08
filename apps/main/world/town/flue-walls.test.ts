import { expect, it } from "vitest"
import { flueWalls } from "#/world/town/flue-walls"
it("keeps the duct open and gives its four masonry walls the declared thickness", () => {
  const { duct, walls } = flueWalls({ x0: 2, z0: 3, x1: 2.5, z1: 3.5 }, 0.1)
  expect(duct).toEqual({ x0: 2.1, z0: 3.1, x1: 2.4, z1: 3.4 })
  expect(walls).toHaveLength(4)
  expect(walls.reduce((s, r) => s + (r.x1 - r.x0) * (r.z1 - r.z0), 0)).toBeCloseTo(0.25 - 0.09)
  for (const t of [0, -0.1, 0.25, 0.3, NaN]) expect(() => flueWalls({ x0: 0, z0: 0, x1: 0.5, z1: 0.5 }, t)).toThrow("leaves no duct")
})
