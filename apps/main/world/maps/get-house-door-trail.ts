import { getHouseDoorApproach } from "#/world/maps/get-house-door-approach"
import { getNearestRoadPoint } from "#/world/maps/get-nearest-road-point"
import type { Vector2Tuple } from "#/lib/engine/vector2-types"
import type { Road } from "#/world/maps/layout-types"
import type { HouseDef } from "#/world/town/house-types"

/** Draw straight out of the door before joining the nearest road; these trails do not change occupancy. */
export function getHouseDoorTrail(roads: readonly Road[], house: HouseDef): Vector2Tuple[] {
  const approach = getHouseDoorApproach(house)
  const step: Vector2Tuple = [approach.position[0] + approach.outward[0] * 0.9, approach.position[1] + approach.outward[1] * 0.9]
  return [approach.position, step, getNearestRoadPoint(roads, step)]
}
