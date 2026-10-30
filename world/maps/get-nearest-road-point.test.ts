import { expect, it } from "vitest"
import { getNearestRoadPoint } from "#/world/maps/get-nearest-road-point"
import type { Road } from "#/world/maps/layout-types"
import type { Vector2Tuple } from "#/lib/engine/vector2-types"

it("prefers the first road on a tie and projects between road samples", () => {
  const roads: Road[] = [
    {
      pts: [
        [0, 0],
        [4, 0],
      ],
      w: 1,
      kind: "dirt",
    },
    {
      pts: [
        [0, 4],
        [4, 4],
      ],
      w: 1,
      kind: "dirt",
    },
  ]
  const snapshot = structuredClone(roads)
  expect(getNearestRoadPoint(roads, [2, 2])).toEqual([2, 0])
  expect(getNearestRoadPoint(roads, [2, 3])).toEqual([2, 4])
  expect(roads).toEqual(snapshot)
})

it("retains the original point without a road segment and accepts repeated endpoints", () => {
  const point: Vector2Tuple = [2, 3]
  expect(getNearestRoadPoint([], point)).toBe(point)
  expect(getNearestRoadPoint([{ pts: [[8, 9]], w: 1, kind: "dirt" }], point)).toBe(point)
  expect(
    getNearestRoadPoint(
      [
        {
          pts: [
            [8, 9],
            [8, 9],
          ],
          w: 1,
          kind: "dirt",
        },
      ],
      point,
    ),
  ).toEqual([8, 9])
})
