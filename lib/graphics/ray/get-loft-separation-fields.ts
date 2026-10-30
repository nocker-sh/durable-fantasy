import { getLoftSegmentSeparationField } from "./get-loft-segment-separation-field"
import type { BoundedField } from "../../engine/field-separation"

/** Every segment must provide a finite enclosing domain and bound; partial loft certificates are never exposed. */
export function getLoftSeparationFields(segments: readonly Parameters<typeof getLoftSegmentSeparationField>[0][]): readonly BoundedField[] | undefined {
  if (!segments.length) return undefined
  const fields: BoundedField[] = []
  for (const segment of segments) {
    const field = getLoftSegmentSeparationField(segment)
    if (field instanceof Error) return undefined
    fields.push(field)
  }

  return fields
}
