import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { Layout } from "#/scripts/lib/building-layout"

/** Match an authored grid to the existing exterior, keeping partial scopes explicit. */
export function auditBuildingEnvelope(building: SettingDocument, envelope: { width_m: number; depth_m: number; scope: string }): string[] {
  if (!building.layout) return []
  const layout = building.layout as Layout
  const errors: string[] = []
  if (building.layout_scope !== envelope.scope) errors.push("Layout scope does not match the exterior definition")
  if (
    ![layout.width * layout.cell_m, layout.depth * layout.cell_m, envelope.width_m, envelope.depth_m].every((n) => Number.isFinite(n) && n > 0) ||
    Math.abs(layout.width * layout.cell_m - envelope.width_m) > 1e-6 ||
    Math.abs(layout.depth * layout.cell_m - envelope.depth_m) > 1e-6
  )
    errors.push("Layout dimensions do not match the exterior definition")
  return errors
}
