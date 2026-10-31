import { buildingLayoutSchema } from "#/scripts/lib/building-layout-schema"
import { getAuthoredFloorLevels } from "#/scripts/lib/get-authored-floor-levels"
import { auditStairSections } from "#/scripts/lib/audit-stair-sections"
import type { SettingDocument } from "#/scripts/lib/setting-document"

/** Decode building structure once and reject document-ID collisions before resolving its rooms. */
export function getAuthoredBuildingSource(building: SettingDocument, documents: readonly SettingDocument[]) {
  const layout = buildingLayoutSchema.safeParse(building.layout)
  if (building.kind !== "buildings" || !layout.success) throw new Error("Building layout required")
  const floorLevels = getAuthoredFloorLevels(building, layout.data.floors.length)
  const byId = new Map(documents.map((document) => [document.id, document]))
  if (byId.size !== documents.length) throw new Error("Duplicate authored document")
  const errors = auditStairSections(building, byId)
  if (errors.length) throw new Error(errors.join("; "))
  return { layout: layout.data, floorLevels, byId }
}
