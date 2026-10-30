import { woolPreparationSchema } from "#/scripts/lib/wool-preparation-schema"
import { textileWoolLotsSchema } from "#/scripts/lib/textile-wool-lots-schema"
import { getWoolPreparationFacilityReview } from "#/scripts/lib/get-wool-preparation-facility-review"
import type { SettingDocument } from "#/scripts/lib/setting-document"

/** A preparation facility also returns to its declared raw pool, including facilities outside a required forward chain. */
export function auditWoolPreparation(documents: ReadonlyMap<string, SettingDocument>): readonly string[] {
  const errors: string[] = []
  for (const facility of documents.values()) {
    if (facility.wool_preparation === undefined) continue
    const parsed = woolPreparationSchema.safeParse(facility.wool_preparation)
    if (!parsed.success) {
      errors.push(`${facility.id}: wool-preparation: Invalid layout`)
      continue
    }
    const operator = documents.get(parsed.data.operator),
      lots = textileWoolLotsSchema.safeParse(operator?.textile_wool_lots)
    if (!operator || !lots.success || lots.data.filter((lot) => lot.id === parsed.data.raw_pool && lot.preparation_facility === facility.id).length !== 1) {
      errors.push(`${facility.id}: wool-preparation: Missing matching raw pool`)
      continue
    }
    const review = getWoolPreparationFacilityReview({ facility, supplier: operator, poolId: parsed.data.raw_pool, documents })
    if (review instanceof Error) errors.push(`${facility.id}: wool-preparation: ${review.message}`)
    if (facility.design_gate === "通過") errors.push(`${facility.id}: wool-preparation: Placement, handling and final disposal remain unresolved`)
  }

  return errors
}
