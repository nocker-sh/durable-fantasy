import { stairGeometry } from "#/world/town/floorplan/stair-geometry"
import { getInteriorStairTrigger } from "#/world/town/get-interior-stair-trigger"
import type { getInteriorStairRegistry } from "#/world/town/get-interior-stair-registry"
import type { InteriorStairEndpoint } from "#/world/town/interior-stair-types"

/** Both directions come from the same physical flight and the same indexed pair of floors. */
export function getInteriorStairEndpoints(registry: ReturnType<typeof getInteriorStairRegistry>): readonly InteriorStairEndpoint[] {
  const endpoints: InteriorStairEndpoint[] = []
  for (const lower of registry.rooms.values()) {
    for (const section of lower.interior.stairSections ?? []) {
      if (lower.interior.floor !== section.lowerFloor) continue
      const upper = registry.floors.get(lower.interior.house.id)?.get(section.upperFloor)
      if (!upper) throw new Error(`Stair destination floor is missing: ${section.id}`)
      const geometry = stairGeometry(section)
      const a = getInteriorStairTrigger({ room: lower, landing: geometry.lowerLanding, flight: geometry.flight })
      const b = getInteriorStairTrigger({ room: upper, landing: geometry.upperLanding, flight: geometry.flight })
      endpoints.push({ map: lower.interior.id, at: a, targetMap: upper.interior.id, targetAt: b }, { map: upper.interior.id, at: b, targetMap: lower.interior.id, targetAt: a })
    }
  }
  return endpoints
}
