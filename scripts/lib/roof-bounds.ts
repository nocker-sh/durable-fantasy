import type { SettingDocument } from "#/scripts/lib/setting-document"
import { auditBuildingSite } from "#/scripts/lib/audit-building-site"
import type { Roof } from "#/scripts/lib/roof-section"

export function roofBounds(building: SettingDocument, metresPerTile: number): readonly [number, number, number, number] | undefined {
  const bounds = auditBuildingSite({ building: building, houses: [], metresPerTile: metresPerTile, roads: [] }).bounds,
    roof = building.roof_section as Roof | undefined
  if (!bounds || !roof) return undefined
  const margin = roof.overhang_m / metresPerTile
  return [bounds[0] - margin, bounds[1] - margin, bounds[2] + margin, bounds[3] + margin]
}
