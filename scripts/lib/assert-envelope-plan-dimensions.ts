import { buildingDimensionsSchema } from "#/scripts/lib/building-dimensions-schema"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { AuthoredPlan } from "#/world/town/floorplan/authored-types"

/** Exterior and interior must originate from the same authored cell dimensions, before either is projected. */
export function assertEnvelopePlanDimensions(building: SettingDocument, plan: Pick<AuthoredPlan, "width" | "depth" | "cellM">): void {
  const layout = buildingDimensionsSchema.safeParse(building.layout)
  if (!layout.success || layout.data.width !== plan.width || layout.data.depth !== plan.depth || layout.data.cell_m !== plan.cellM) throw new Error("Exterior dimensions disagree with authored layout")
}
