import { getTextileWoolAllocationError } from "#/scripts/lib/get-textile-wool-allocation-error"
import { getTextileOrderWorkplaceError } from "#/scripts/lib/get-textile-order-workplace-error"
import { getSleepingTextileCuttings } from "#/scripts/lib/get-sleeping-textile-cuttings"
import { getTextileStages } from "#/scripts/lib/get-textile-stages"
import type { textileOrdersSchema } from "#/scripts/lib/textile-orders-schema"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { z } from "zod"
type Props = Readonly<{ supplier: SettingDocument; order: z.infer<typeof textileOrdersSchema>[number]; documents: ReadonlyMap<string, SettingDocument> }>

/** Every declared supplier entry must return to an actual beneficiary's measured cloth plan, even when the required forward chain already exists. */
export function getTextileOrderError(props: Props): Error | null {
  const room = props.documents.get(props.order.room)
  if (props.supplier.kind !== "residents" || room?.kind !== "rooms") return new Error("Textile order has no resident supplier or target room")
  const cuttings = getSleepingTextileCuttings(room)
  if (cuttings instanceof Error) return new Error("Textile order has no matching cutting plan", { cause: cuttings })
  const matches = cuttings.filter((cutting) => cutting.source.cloth_id === props.order.cloth)
  if (matches.length !== 1) return new Error("Textile order has no matching cutting plan")
  const cutting = matches[0]
  const stage = getTextileStages({ textile: cutting.textile, owner: cutting.source.owner }).find((candidate) => candidate.stage === props.order.stage)
  const order = props.order
  if (
    !stage ||
    stage.supplier !== props.supplier.id ||
    order.cloth !== cutting.source.cloth_id ||
    order.id !== `${cutting.source.cloth_id}:${stage.stage}` ||
    order.beneficiary !== cutting.source.owner ||
    order.recipient !== stage.recipient
  )
    return new Error("Textile order does not match its supplier and cloth allocation")

  return getTextileWoolAllocationError({ supplier: props.supplier, roomId: room.id, cutting, order, documents: props.documents }) ?? getTextileOrderWorkplaceError(props)
}
