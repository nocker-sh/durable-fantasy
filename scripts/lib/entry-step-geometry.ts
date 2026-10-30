import { getEntryStepSection } from "#/scripts/lib/get-entry-step-section"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { EntrySteps } from "#/scripts/lib/entry-steps-types"
import { getEntryStepSite } from "#/scripts/lib/get-entry-step-site"
import { getEntryStepPoint } from "#/scripts/lib/get-entry-step-point"
import { getEntryStepRectangle } from "#/scripts/lib/get-entry-step-rectangle"
import { getEntryStepSurfaces } from "#/scripts/lib/get-entry-step-surfaces"
type Props = Readonly<{ building: SettingDocument; documents: ReadonlyMap<string, SettingDocument>; steps: EntrySteps; metres: number }>

/** Both landings and every tread share the doorway's rotation and the outdoor scale. */
export function entryStepGeometry(props: Props) {
  const site = getEntryStepSite(props)
  if (!site) return undefined
  const section = getEntryStepSection(site)
  if (!section) return undefined
  return {
    upperPoint: site.pose.point,
    outward: site.pose.outward,
    bounds: getEntryStepRectangle(section, 0, section.length),
    rise: section.rise,
    width: section.width,
    doorwayWidth: site.pose.width_m,
    length: section.length,
    lowerPoint: getEntryStepPoint(site, section.length),
    surfaces: getEntryStepSurfaces(section),
  }
}
