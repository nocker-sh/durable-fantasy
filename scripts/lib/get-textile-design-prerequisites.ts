import { woolPreparationSchema } from "#/scripts/lib/wool-preparation-schema"
import { textileOrdersSchema } from "#/scripts/lib/textile-orders-schema"
import { textileWoolLotsSchema } from "#/scripts/lib/textile-wool-lots-schema"
import type { SettingDocument } from "#/scripts/lib/setting-document"

/** Material recipients and consuming rooms participate in the supplier's design gate, without treating in-document pool IDs as document IDs. */
export function getTextileDesignPrerequisites(document: SettingDocument): readonly string[] {
  const orders = textileOrdersSchema.safeParse(document.textile_orders),
    lots = textileWoolLotsSchema.safeParse(document.textile_wool_lots),
    references = new Set<string>()
  if (orders.success)
    for (const order of orders.data) {
      references.add(order.room)
      references.add(order.beneficiary)
      references.add(order.recipient)
      if (order.workplace) references.add(order.workplace.room)
    }
  if (lots.success)
    for (const lot of lots.data) {
      references.add(lot.preparation_facility)
      for (const allocation of lot.allocations) references.add(allocation.room)
    }
  const preparation = woolPreparationSchema.safeParse(document.wool_preparation)
  if (preparation.success) {
    references.add(preparation.data.operator)
    references.add(preparation.data.water_source)
    if (typeof document.owner_building === "string") references.add(document.owner_building)
  }
  references.delete(document.id)

  return [...references]
}
