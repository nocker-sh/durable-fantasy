import { z } from "zod"
import { entryStepsSchema } from "#/scripts/lib/entry-steps-schema"
import { getEntryOpeningErrors } from "#/scripts/lib/get-entry-opening-errors"
import { getEntryStepErrors } from "#/scripts/lib/get-entry-step-errors"
import type { EntryStepsAudit } from "#/scripts/lib/entry-steps-types"
const entriesSchema = z.array(entryStepsSchema)

/** Keep duplicate detection and diagnostic order across separately checked doorway, route and terrain constraints. */
export function auditEntrySteps(props: EntryStepsAudit): string[] {
  const entries = entriesSchema.safeParse(props.building.entry_steps ?? [])
  if (!entries.success) return ["Invalid exterior stair dimensions"]
  const errors: string[] = []
  const seen = new Set<string>()
  if (entries.data.length) errors.push(...getEntryOpeningErrors(props.building))
  for (const steps of entries.data) {
    const key = `${steps.room}:${steps.door}`
    if (seen.has(key)) errors.push("Duplicate exterior stair at doorway")
    seen.add(key)
    errors.push(...getEntryStepErrors({ ...props, steps }))
  }
  return [...new Set(errors)]
}
