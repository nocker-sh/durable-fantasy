import { roofBounds } from "#/scripts/lib/roof-bounds"
import { segmentRectDistance } from "#/lib/engine/segment-rect-distance"
import { auditBuildingSite } from "#/scripts/lib/audit-building-site"
import type { SettingDocument } from "#/scripts/lib/setting-document"
type Watercourse = { name: string; points: readonly (readonly number[])[]; half_width: number }
/** Water occupies its full width, even when the centreline misses the house. */
export function auditBuildingWater(building: SettingDocument, metresPerTile: number, watercourses: readonly Watercourse[]): string[] {
  if (!building.site_plan) return []
  const bounds = auditBuildingSite({ building: building, houses: [], metresPerTile: metresPerTile, roads: [] }).bounds
  if (!bounds) return []
  const roof = roofBounds(building, metresPerTile)
  const errors: string[] = []
  for (const water of watercourses) {
    if (!Number.isFinite(water.half_width) || water.half_width < 0 || water.points.length < 2 || water.points.some((p) => p.length !== 2 || p.some((n) => !Number.isFinite(n)))) {
      errors.push(`Invalid watercourse ${water.name}`)
      continue
    }
    if (water.points.slice(1).some((point, index) => segmentRectDistance(bounds, water.points[index], point) < water.half_width)) errors.push(`Outdoor footprint covers watercourse ${water.name}`)
    else if (roof && water.points.slice(1).some((point, index) => segmentRectDistance(roof, water.points[index], point) < water.half_width))
      errors.push(`Roof overhang covers watercourse ${water.name}`)
  }
  return errors
}
