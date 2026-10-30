import type { EntryStepSiteInput } from "#/scripts/lib/entry-step-geometry-types"
import { siteDoorPose } from "#/scripts/lib/site-door"
export function getEntryStepDoorPose(site: EntryStepSiteInput, span: number, metres: number) {
  return siteDoorPose({
    grid: site.room.grid,
    room_origin: site.room.origin,
    door: site.steps.door,
    span,
    site_origin: site.building.site_plan.origin,
    width_m: site.building.layout.width * site.building.layout.cell_m,
    depth_m: site.building.layout.depth * site.building.layout.cell_m,
    rotation_quarters: site.building.site_plan.rotation_quarters,
    metres_per_tile: metres,
  })
}
