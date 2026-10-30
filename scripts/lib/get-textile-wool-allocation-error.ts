import { textileWoolLotsSchema } from "#/scripts/lib/textile-wool-lots-schema"
import { getTextileWoolLotReview } from "#/scripts/lib/get-textile-wool-lot-review"
import type { SleepingTextileCutting } from "#/scripts/lib/sleeping-textile-cutting"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { textileOrdersSchema } from "#/scripts/lib/textile-orders-schema"
import type { z } from "zod"
type Props = Readonly<{
  supplier: SettingDocument
  roomId: string
  cutting: SleepingTextileCutting
  order: z.infer<typeof textileOrdersSchema>[number]
  documents: ReadonlyMap<string, SettingDocument>
}>

/** The required wool order must reserve its own measured cloth from the same finite pool. */
export function getTextileWoolAllocationError(props: Props): Error | null {
  if (props.order.stage !== "wool") return null
  const source = props.cutting.source,
    parsed = textileWoolLotsSchema.safeParse(props.supplier.textile_wool_lots)
  if (!parsed.success || props.order.raw_lot !== source.material_budget.raw_lot) return new Error("Textile wool order has no matching proposed pool")
  const matches = parsed.data.filter((lot) => lot.id === props.order.raw_lot)
  if (matches.length !== 1 || matches[0].allocations.filter((allocation) => allocation.room === props.roomId && allocation.cloth === source.cloth_id).length !== 1)
    return new Error("Textile wool order lacks its unique pool allocation")
  const review = getTextileWoolLotReview({ supplier: props.supplier, lot: matches[0], documents: props.documents })
  if (review instanceof Error) return review

  return null
}
