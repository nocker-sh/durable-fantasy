import { z } from "zod"
import { entryStepsSchema } from "#/scripts/lib/entry-steps-schema"
import { entryApproachSchema } from "#/scripts/lib/entry-approach-schema"
import { entryApproachSectionSchema } from "#/scripts/lib/entry-approach-section-schema"
import { getEntryApproachSection } from "#/scripts/lib/get-entry-approach-section"
import type { EntryApproachContext } from "#/scripts/lib/entry-approach-section-types"

const sourceSchema = z.object({
  site_plan: z.object({ approaches: z.array(entryApproachSchema.extend({ section: entryApproachSectionSchema.optional() })).default([]) }),
  entry_steps: z.array(entryStepsSchema).default([]),
})

/** A proposed profile is measurable, but it does not close a building's remaining design gate. */
export function auditEntryApproachSections(props: EntryApproachContext): string[] {
  if (!props.building.site_plan) return []
  const parsed = sourceSchema.safeParse(props.building)
  if (!parsed.success) return ["Invalid entry approach section"]
  return parsed.data.site_plan.approaches.flatMap((approach) => {
    if (!approach.section) {
      const hasStair = parsed.data.entry_steps.some((steps) => steps.room === approach.room && steps.door.every((coordinate, axis) => coordinate === approach.door[axis]))
      if (props.building.design_gate === "通過" && hasStair) return ["Entry approach has no designed surface section"]
      return []
    }
    const section = getEntryApproachSection({ ...props, approach: { ...approach, section: approach.section } })
    if (section instanceof Error) return [section.message]
    if (props.building.design_gate === "通過" && approach.section.status !== "designed") return ["Entry surface is still proposed"]

    return []
  })
}
