import type { SettingDocument } from "#/scripts/lib/setting-document"
import { getResidentProposalError } from "#/scripts/lib/get-resident-proposal-error"
type Props = { documents: ReadonlyMap<string, SettingDocument>; residents: readonly { name: string }[]; looks: readonly unknown[] }

/** Resolve the native parallel look table by resident identity; copied source outfits omit runtime headwear and neck-wrap rules. */
export function auditResidentAppearanceSources(props: Props): string[] {
  const errors: string[] = []
  for (const doc of props.documents.values()) {
    if (doc.resident_proposal !== undefined) {
      const error = getResidentProposalError({ resident: doc, documents: props.documents })
      if (error) errors.push(`${doc.id}: ${error.message}`)
      if (props.residents.some((resident) => resident.name === doc.title)) errors.push(`${doc.id}: native resident cannot use an unimplemented proposal`)
      continue
    }
    if (doc.kind !== "residents") continue
    const source = doc.appearance_source
    if (doc.appearance !== undefined) errors.push(`${doc.id}: runtime appearance must be referenced, not copied`)
    if (
      !source ||
      typeof source !== "object" ||
      !("file" in source) ||
      source.file !== "world/town/residents.ts" ||
      !("export" in source) ||
      source.export !== "RESIDENT_LOOKS" ||
      !("key" in source) ||
      source.key !== doc.title
    ) {
      errors.push(`${doc.id}: missing or invalid appearance source`)
      continue
    }
    const matches = props.residents.flatMap((resident, index) => (resident.name === source.key ? [index] : []))
    if (matches.length !== 1 || !props.looks[matches[0]] || typeof props.looks[matches[0]] !== "object") errors.push(`${doc.id}: referenced appearance does not exist uniquely`)
  }

  return errors
}
