import { getWoolPreparationFacilityReview } from "#/scripts/lib/get-wool-preparation-facility-review"
import { getWoolLotAllocationBudget } from "#/scripts/lib/get-wool-lot-allocation-budget"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { textileWoolLotsSchema } from "#/scripts/lib/textile-wool-lots-schema"
import type { z } from "zod"
type Props = Readonly<{ supplier: SettingDocument; lot: z.infer<typeof textileWoolLotsSchema>[number]; documents: ReadonlyMap<string, SettingDocument> }>

/** A finite proposed fleece pool reserves each cloth once; remaining budget is never runtime stock. */
export function getTextileWoolLotReview(props: Props) {
  const identities = new Set<string>(),
    budgets: number[] = []
  for (const allocation of props.lot.allocations) {
    if (identities.has(allocation.cloth)) return new Error("Wool pool duplicates a cloth allocation")
    identities.add(allocation.cloth)
    const budget = getWoolLotAllocationBudget({ supplier: props.supplier, lotId: props.lot.id, allocation, documents: props.documents })
    if (budget instanceof Error) return budget
    budgets.push(budget.rawFleeceG)
  }
  const reservedG = budgets.reduce((total, mass) => total + mass, 0)
  if (!Number.isSafeInteger(reservedG) || !Number.isSafeInteger(props.lot.dry_mass_g) || props.lot.dry_mass_g <= 0 || reservedG > props.lot.dry_mass_g)
    return new Error("Wool pool overallocates its proposed dry fleece")

  const facility = props.documents.get(props.lot.preparation_facility)
  if (!facility) return new Error("Wool pool has no separate preparation facility")
  const preparation = getWoolPreparationFacilityReview({ facility, supplier: props.supplier, poolId: props.lot.id, documents: props.documents })
  if (preparation instanceof Error) return preparation

  return { reservedG, remainingG: props.lot.dry_mass_g - reservedG }
}
