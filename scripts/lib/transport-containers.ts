import type { SettingDocument } from "#/scripts/lib/setting-document"
/** Container capacity belongs to a physical vessel, not just to a named transport route. */
export function auditTransportContainers(documents: ReadonlyMap<string, SettingDocument>): string[] {
  const errors: string[] = [],
    ids = new Set<string>()
  for (const doc of documents.values())
    for (const furniture of doc.furniture ?? []) {
      const vessel = furniture.transport_container
      if (!vessel) continue
      const fail = (message: string) => errors.push(`${doc.id}: ${vessel.id}: ${message}`)
      if (ids.has(vessel.id)) fail("duplicate transport container")
      ids.add(vessel.id)
      if (!doc.grid) {
        fail("container has no physical grid")
        continue
      }
      const dimensions = [vessel.outer_diameter_m, vessel.outer_height_m, vessel.inner_diameter_m, vessel.usable_depth_m, vessel.capacity_l, vessel.empty_mass_kg]
      if (!dimensions.every((n) => Number.isFinite(n) && n > 0)) {
        fail("invalid container dimensions or mass")
        continue
      }
      if (vessel.shape !== "cylinder") fail("unsupported container shape")
      if (!vessel.lidded) fail(vessel.stream === "potable_water" ? "drinking-water container has no lid" : "waste container has no lid")
      if (vessel.inner_diameter_m >= vessel.outer_diameter_m || vessel.usable_depth_m >= vessel.outer_height_m) fail("inner dimensions leave no wall or base")
      if (vessel.outer_diameter_m > Math.min(furniture.rect[2], furniture.rect[3]) * doc.grid.cell_m + 1e-9) fail("container does not fit its furniture footprint")
      const volumeLitres = Math.PI * (vessel.inner_diameter_m / 2) ** 2 * vessel.usable_depth_m * 1000
      if (vessel.capacity_l > volumeLitres + 1e-9) fail("capacity exceeds the vessel's internal volume")
    }
  return errors
}
