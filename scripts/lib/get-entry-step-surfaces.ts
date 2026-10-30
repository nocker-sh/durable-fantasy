import type { EntryStepSection, EntryStepRectangle } from "#/scripts/lib/entry-step-geometry-types"
import { getEntryStepRectangle } from "#/scripts/lib/get-entry-step-rectangle"
export function getEntryStepSurfaces(section: EntryStepSection): readonly { rect: EntryStepRectangle; height: number }[] {
  const steps = section.steps
  const surfaces = Array.from({ length: steps.risers - 1 }, (_, index) => ({
    rect: getEntryStepRectangle(section, steps.landing_depth_m + index * steps.going_m, steps.landing_depth_m + (index + 1) * steps.going_m),
    height: section.elevation - (index + 1) * section.rise,
  }))
  surfaces.unshift({ rect: getEntryStepRectangle(section, 0, steps.landing_depth_m), height: section.elevation })
  surfaces.push({ rect: getEntryStepRectangle(section, section.length - steps.landing_depth_m, section.length), height: steps.lower_elevation_m })
  return surfaces
}
