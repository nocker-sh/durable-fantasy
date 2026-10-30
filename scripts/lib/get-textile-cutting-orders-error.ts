import { getTextileWoolAllocationError } from "#/scripts/lib/get-textile-wool-allocation-error"
import { getTextileOrderWorkplaceError } from "#/scripts/lib/get-textile-order-workplace-error"
import type { SleepingTextileCutting } from "#/scripts/lib/sleeping-textile-cutting"
import { textileOrdersSchema } from "#/scripts/lib/textile-orders-schema"
import { getTextileStages } from "#/scripts/lib/get-textile-stages"
import type { SettingDocument } from "#/scripts/lib/setting-document"
type Props = Readonly<{ room: SettingDocument; cutting: SleepingTextileCutting; documents: ReadonlyMap<string, SettingDocument> }>

/** Follow the proposed handoff chain for one beneficiary without inventing input weights or treating plans as fulfilled stock. */
export function getTextileCuttingOrdersError(props: Props): Error | null {
  const cutting = props.cutting
  const label = { two_hemmed_blankets_cut_layout: "Blanket", two_six_panel_pillow_covers_cut_layout: "Pillow cover" }[cutting.source.scope]
  const stages = getTextileStages({ textile: cutting.textile, owner: cutting.source.owner })
  for (const stage of stages) {
    const supplier = props.documents.get(stage.supplier),
      parsed = textileOrdersSchema.safeParse(supplier?.textile_orders)
    if (!supplier || !parsed.success) return new Error(`${label} supply has no declared supplier orders`, { cause: { supplier: stage.supplier } })
    const orders = parsed.data.filter((order) => order.room === props.room.id && order.cloth === cutting.source.cloth_id && order.stage === stage.stage)
    if (orders.length !== 1 || orders[0].id !== `${cutting.source.cloth_id}:${stage.stage}` || orders[0].beneficiary !== cutting.source.owner || orders[0].recipient !== stage.recipient)
      return new Error(`${label} supply handoff is missing, duplicated or misdirected`, { cause: { supplier: stage.supplier, stage: stage.stage } })
    const allocation = getTextileWoolAllocationError({ supplier, roomId: props.room.id, cutting, order: orders[0], documents: props.documents })
    if (allocation) return allocation
    const workplace = getTextileOrderWorkplaceError({ supplier, order: orders[0], documents: props.documents })
    if (workplace) return workplace
  }

  return null
}
