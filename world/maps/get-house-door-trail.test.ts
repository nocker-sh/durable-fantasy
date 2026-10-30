import { expect, it } from "vitest"
import { getHouseDoorTrail } from "#/world/maps/get-house-door-trail"
import { HOUSES } from "#/world/town/houses"
import type { HouseDef } from "#/world/town/house-types"
import type { Road } from "#/world/maps/layout-types"

it("leaves the door straight outward before joining the road without changing the house", () => {
  const house: HouseDef = { ...HOUSES[0], x0: 10, z0: 20, x1: 16, z1: 28, door: { side: "s", u: 2 } }
  const roads: Road[] = [
    {
      pts: [
        [0, 40],
        [30, 40],
      ],
      kind: "dirt",
      w: 1,
    },
  ]
  const snapshot = structuredClone({ house, roads })
  expect(getHouseDoorTrail(roads, house)).toEqual([
    [12, 28.3],
    [12, 29.2],
    [12, 40],
  ])
  expect({ house, roads }).toEqual(snapshot)
})

it("keeps the outward step as the endpoint when there is no road segment", () => {
  const trail = getHouseDoorTrail([], HOUSES[0])
  expect(trail).toHaveLength(3)
  expect(trail[2]).toBe(trail[1])
})
