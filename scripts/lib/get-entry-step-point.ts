import type { EntryStepSite } from "#/scripts/lib/entry-step-geometry-types"
export function getEntryStepPoint(site: EntryStepSite, distance: number): readonly [number, number] {
  return [site.pose.point[0] + (site.pose.outward[0] * distance) / site.metres, site.pose.point[1] + (site.pose.outward[1] * distance) / site.metres]
}
