import { expect, it } from "vitest"
import { getHouseDoorApproach } from "#/world/maps/get-house-door-approach"
import type { HouseDef } from "#/world/town/house-types"

it("keeps the wall-specific door offset and outward direction on all four sides", () => {
  const sides: HouseDef["door"]["side"][] = ["s", "n", "e", "w"]
  const house = { x0: 10, z0: 20, x1: 16, z1: 28 }
  expect(sides.map((side) => getHouseDoorApproach({ ...house, door: { side, u: 2 } }))).toEqual([
    { position: [12, 28.3], outward: [0, 1] },
    { position: [14, 19.7], outward: [0, -1] },
    { position: [16.3, 26], outward: [1, 0] },
    { position: [9.7, 22], outward: [-1, 0] },
  ])
})
