import { getSleepingTextileCuttings } from "#/scripts/lib/get-sleeping-textile-cuttings"
import { getSleepingTextileMaterialBudget } from "#/scripts/lib/get-sleeping-textile-material-budget"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { textileWoolLotsSchema } from "#/scripts/lib/textile-wool-lots-schema"
import type { z } from "zod"
type Props = Readonly<{ supplier: SettingDocument; lotId: string; allocation: z.infer<typeof textileWoolLotsSchema>[number]["allocations"][number]; documents: ReadonlyMap<string, SettingDocument> }>

/** Every pool entry must resolve back to the same supplier and the beneficiary's distinct cloth budget. */
export function getWoolLotAllocationBudget(props: Props) {
  const room = props.documents.get(props.allocation.room)
  if (room?.kind !== "rooms" || props.supplier.kind !== "residents") return new Error("Wool allocation has no resident supplier or target room")
  const cuttings = getSleepingTextileCuttings(room)
  if (cuttings instanceof Error) return new Error("Wool allocation has no measured textile cutting", { cause: cuttings })
  const matches = cuttings.filter((cutting) => cutting.source.cloth_id === props.allocation.cloth)
  if (matches.length !== 1) return new Error("Wool allocation has no unique cloth budget")
  const cutting = matches[0]
  if (cutting.textile.wool_supplier !== props.supplier.id || cutting.source.material_budget.raw_lot !== props.lotId) return new Error("Wool allocation belongs to another supplier or pool")

  return getSleepingTextileMaterialBudget(cutting)
}
