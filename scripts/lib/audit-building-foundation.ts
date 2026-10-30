import { scalarFieldRange } from "#/lib/engine/scalar-field-range"
import type { ScalarField } from "#/lib/engine/scalar-field"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import { auditBuildingSite } from "#/scripts/lib/audit-building-site"
import { foundationSchema } from "#/scripts/lib/foundation-schema"
import { floorLevelsSchema } from "#/scripts/lib/floor-levels-schema"

/** Floor levels stay relative to the ground floor; the foundation is checked against the world datum. */
export function auditBuildingFoundation(building: SettingDocument, terrain: ScalarField, metresPerTile: number): string[] {
  if (building.foundation === undefined) return []
  const foundation = foundationSchema.safeParse(building.foundation)
  if (!foundation.success) return ["Invalid building foundation"]
  const levels = floorLevelsSchema.safeParse(building.floor_levels ?? [])
  if (!levels.success || building.kind !== "buildings" || levels.data.find((level) => level.floor === 0)?.elevation_m !== 0) return ["Foundation needs a ground floor at relative elevation zero"]
  const bounds = auditBuildingSite({ building: building, houses: [], metresPerTile: metresPerTile, roads: [] }).bounds
  if (!bounds) return ["Foundation has no dimensioned site plan"]
  const limit = (terrain.size - 1.001) / terrain.resolution
  if (bounds[0] < 0 || bounds[1] < 0 || bounds[2] > limit || bounds[3] > limit) return ["Foundation footprint exceeds sampled terrain"]
  const ground = scalarFieldRange(terrain, bounds)
  const underside = foundation.data.floor_elevation_m - foundation.data.floor_thickness_m
  return underside + 1e-9 < ground.max * metresPerTile + foundation.data.minimum_ground_gap_m ? ["Raised floor intersects terrain or lacks its designed ground gap"] : []
}
