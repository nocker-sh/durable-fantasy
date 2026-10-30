import type { EntryStepSite, EntryStepSection } from "#/scripts/lib/entry-step-geometry-types"
export function getEntryStepSection(site: EntryStepSite): EntryStepSection | null {
  const section = {
    ...site,
    length: 2 * site.steps.landing_depth_m + (site.steps.risers - 1) * site.steps.going_m,
    width: site.steps.clear_width_m + 2 * site.steps.rail_inset_m,
    rise: (site.elevation - site.steps.lower_elevation_m) / site.steps.risers,
  }
  if (![section.length, section.width, section.rise, section.length / site.metres, section.width / site.metres].every(Number.isFinite)) return null
  return section
}
