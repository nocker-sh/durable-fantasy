import { expect, it } from "vitest"
import { createSeawardShape } from "#/world/maps/create-seaward-shape"
import { getPassGroundHeight } from "#/world/maps/get-pass-ground-height"
import { getDirtRoad } from "#/world/maps/get-dirt-road"

it("retains the inland height and lowers the far sea by the configured depth", () => {
  const input = { x: -100, z: 17, h: 4, roadD: 0 }
  const shape = createSeawardShape(30, 8, 3)
  expect(shape(input)).toBe(4)
  expect(shape({ ...input, x: 100 })).toBe(1)
  expect(createSeawardShape(30, 8)({ ...input, x: 100 })).toBe(1.6)
})

it("keeps the pass centre on the road and retains dirt-road width and samples", () => {
  expect(getPassGroundHeight({ x: 12, z: 17, h: 3, roadD: 2 })).toBe(3)
  const road = getDirtRoad(
    [
      [0, 0],
      [4, 0],
    ],
    0.7,
  )
  expect(road.kind).toBe("dirt")
  expect(road.w).toBe(0.7)
  expect(road.pts).toHaveLength(9)
  expect(road.pts[0]).toEqual([0, 0])
  expect(road.pts.at(-1)).toEqual([4, 0])
})
