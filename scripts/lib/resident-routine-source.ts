import type { SettingDocument } from "#/scripts/lib/setting-document"
import { getResidentProposalError } from "#/scripts/lib/get-resident-proposal-error"
/** Runtime schedules keep their times and locations in code; documents explain their context. */
export function auditResidentRoutineSources(documents: ReadonlyMap<string, SettingDocument>, routines: Readonly<Record<string, readonly unknown[]>>): string[] {
  const errors: string[] = []
  for (const doc of documents.values()) {
    if (doc.resident_proposal !== undefined) {
      const error = getResidentProposalError({ resident: doc, documents })
      if (error) errors.push(`${doc.id}: ${error.message}`)
      if (Object.hasOwn(routines, doc.title)) errors.push(`${doc.id}: native routine cannot use an unimplemented proposal`)
      continue
    }
    if (doc.kind !== "residents") continue
    if (doc.routine !== undefined) errors.push(`${doc.id}: runtime schedule must be referenced, not copied`)
    const source = doc.routine_source as { file: string; export: string; key: string } | undefined
    if (!source || source.file !== "world/town/routines.ts" || source.export !== "ROUTINES") {
      errors.push(`${doc.id}: missing or invalid routine source`)
      continue
    }
    if (source.key !== doc.title) errors.push(`${doc.id}: routine source belongs to another resident`)
    if (!Object.hasOwn(routines, source.key) || !routines[source.key].length) errors.push(`${doc.id}: referenced routine does not exist`)
  }
  return errors
}
