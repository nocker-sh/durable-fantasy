import type { SettingDocument } from "#/scripts/lib/setting-document"
import { buildingDimensionsSchema } from "#/scripts/lib/building-dimensions-schema"

/** Match an authored grid to the existing exterior, keeping partial scopes explicit. */
export function auditBuildingEnvelope(building: SettingDocument, envelope: { width_m: number; depth_m: number; scope: string }): string[] {
  if (building.layout === null || building.layout === undefined) return []
  const dimensions = buildingDimensionsSchema.safeParse(building.layout)
  const errors: string[] = []
  if (building.layout_scope !== envelope.scope) errors.push("Layout scope does not match the exterior definition")
  if (
    !dimensions.success ||
    ![envelope.width_m, envelope.depth_m].every((length) => Number.isFinite(length) && length > 0) ||
    Math.abs(dimensions.data.width * dimensions.data.cell_m - envelope.width_m) > 1e-6 ||
    Math.abs(dimensions.data.depth * dimensions.data.cell_m - envelope.depth_m) > 1e-6
  )
    errors.push("Layout dimensions do not match the exterior definition")
  return errors
}
