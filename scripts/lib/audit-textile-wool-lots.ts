import { textileWoolLotsSchema } from "#/scripts/lib/textile-wool-lots-schema"
import { getTextileWoolLotReview } from "#/scripts/lib/get-textile-wool-lot-review"
import type { SettingDocument } from "#/scripts/lib/setting-document"

/** Reverse-audit every declared pool, including allocations beyond the beneficiary's required chain. */
export function auditTextileWoolLots(documents: ReadonlyMap<string, SettingDocument>): readonly string[] {
  const errors: string[] = [],
    ids = new Set<string>()
  for (const supplier of documents.values()) {
    if (supplier.textile_wool_lots === undefined) continue
    const parsed = textileWoolLotsSchema.safeParse(supplier.textile_wool_lots)
    if (!parsed.success) {
      errors.push(`${supplier.id}: textile-wool: Invalid proposed pools`)
      continue
    }
    if (supplier.design_gate === "通過") errors.push(`${supplier.id}: textile-wool: Proposed fleece pools remain unresolved`)
    for (const lot of parsed.data) {
      if (ids.has(lot.id)) errors.push(`${supplier.id}: textile-wool: Duplicate pool ${lot.id}`)
      ids.add(lot.id)
      const review = getTextileWoolLotReview({ supplier, lot, documents })
      if (review instanceof Error) errors.push(`${supplier.id}: textile-wool: ${review.message}`)
    }
  }

  return errors
}
