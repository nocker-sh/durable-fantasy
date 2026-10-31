import { auditMissingStairSections } from "#/scripts/lib/audit-missing-stair-sections"
import { authoredStairSectionsSourceSchema } from "#/scripts/lib/authored-renderer-source-schema"
import { compileAuthoredStairSection } from "#/scripts/lib/compile-authored-stair-section"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { AuthoredPlan } from "#/world/town/floorplan/authored-types"

/** Incomplete stair design remains a document state, never a guessed runtime opening or rail. */
export function compileAuthoredStairSections(building: SettingDocument, plan: AuthoredPlan, documents: ReadonlyMap<string, SettingDocument>): AuthoredPlan["stairSections"] {
  const sections = authoredStairSectionsSourceSchema.safeParse(building.stair_sections)
  if (!sections.success) throw new Error("Runtime stair section dimensions are incomplete")
  const seen = new Set(sections.data.map((section) => `${section.lower_room}:${section.upper_room}:${section.furniture}`))
  const errors = auditMissingStairSections({ roomIds: plan.rooms.map((room) => room.id), documents, seen })
  if (errors.length) throw new Error(errors.join("; "))
  return sections.data.map((section) => compileAuthoredStairSection({ section, plan }))
}
