import { stairSectionsSchema } from "#/scripts/lib/stair-sections-schema"
import { floorLevelsSchema } from "#/scripts/lib/floor-levels-schema"
import { auditStairSection } from "#/scripts/lib/audit-stair-section"
import { auditMissingStairSections } from "#/scripts/lib/audit-missing-stair-sections"
import type { SettingDocument } from "#/scripts/lib/setting-document"

/** A matching rectangle on two floors is insufficient to design the stair between them. */
export function auditStairSections(building: SettingDocument, documents: ReadonlyMap<string, SettingDocument>): string[] {
  const sections = stairSectionsSchema.safeParse(building.stair_sections ?? [])
  if (!sections.success) return ["Invalid stair sections"]
  const levels = floorLevelsSchema.safeParse(building.floor_levels ?? [])
  if (!levels.success) return ["Invalid stair floor levels"]
  const errors: string[] = [],
    seen = new Set<string>()
  if (new Set(levels.data.map((level) => level.floor)).size !== levels.data.length) errors.push("Duplicate floor elevation")
  for (const section of sections.data) {
    const key = `${section.lower_room}:${section.upper_room}:${section.furniture}`
    if (seen.has(key)) errors.push("Duplicate stair section")
    seen.add(key)
    errors.push(...auditStairSection({ building, documents, section, levels: levels.data }))
  }
  errors.push(...auditMissingStairSections({ building, documents, seen }))
  return [...new Set(errors)]
}
