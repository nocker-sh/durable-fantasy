import { getMatchingInteriorStairSection } from "#/world/town/get-matching-interior-stair-section"
import { stairGeometry } from "#/world/town/floorplan/stair-geometry"
import { getInteriorStairTrigger } from "#/world/town/get-interior-stair-trigger"
import type { getInteriorStairRegistry } from "#/world/town/get-interior-stair-registry"
import type { InteriorStairEndpoint } from "#/world/town/interior-stair-types"

/** Both directions come from the same physical flight and the same indexed pair of floors. */
export function getInteriorStairEndpoints(registry: ReturnType<typeof getInteriorStairRegistry>): readonly InteriorStairEndpoint[] {
  const endpoints: InteriorStairEndpoint[] = []
  for (const lower of registry.rooms.values()) {
    for (const section of lower.interior.stairSections ?? []) {
      if (lower.interior.floor !== section.lowerFloor) {
        const source = registry.floors.get(lower.interior.house.id)?.get(section.lowerFloor)
        if (lower.interior.floor !== section.upperFloor || source?.interior.stairSections?.filter((flight) => flight.id === section.id).length !== 1)
          throw new Error(`Stair floor views disagree: ${section.id}`)
        continue
      }
      const upper = registry.floors.get(lower.interior.house.id)?.get(section.upperFloor)
      if (!upper) throw new Error(`Stair destination floor is missing: ${section.id}`)
      const upperSection = getMatchingInteriorStairSection({ lower: lower.interior, upper: upper.interior, section })
      const geometry = stairGeometry(section),
        upperGeometry = stairGeometry(upperSection)
      const a = getInteriorStairTrigger({ room: lower, landing: geometry.lowerLanding, flight: geometry.flight })
      const b = getInteriorStairTrigger({ room: upper, landing: upperGeometry.upperLanding, flight: upperGeometry.flight })
      endpoints.push({ map: lower.interior.id, at: a, targetMap: upper.interior.id, targetAt: b }, { map: upper.interior.id, at: b, targetMap: lower.interior.id, targetAt: a })
    }
  }
  return endpoints
}
