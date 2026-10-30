import { auditWoolPreparation } from "#/scripts/lib/audit-wool-preparation"
import { auditTextileWoolLots } from "#/scripts/lib/audit-textile-wool-lots"
import { textileOrdersSchema } from "#/scripts/lib/textile-orders-schema"
import { getTextileOrderError } from "#/scripts/lib/get-textile-order-error"
import type { SettingDocument } from "#/scripts/lib/setting-document"

/** Audit all declared orders, including orphans and duplicates outside the three entries requested by each room. */
export function auditTextileOrders(documents: ReadonlyMap<string, SettingDocument>): readonly string[] {
  const errors: string[] = [],
    ids = new Set<string>()
  for (const supplier of documents.values()) {
    if (supplier.textile_orders === undefined) continue
    const parsed = textileOrdersSchema.safeParse(supplier.textile_orders)
    if (!parsed.success) {
      errors.push(`${supplier.id}: textile-orders: Invalid proposed orders`)
      continue
    }
    if (supplier.design_gate === "通過") errors.push(`${supplier.id}: textile-orders: Proposed textile orders remain unresolved`)
    for (const order of parsed.data) {
      if (ids.has(order.id)) errors.push(`${supplier.id}: textile-orders: Duplicate order ${order.id}`)
      ids.add(order.id)
      const error = getTextileOrderError({ supplier, order, documents })
      if (error) errors.push(`${supplier.id}: textile-orders: ${error.message}`)
    }
  }

  return [...errors, ...auditTextileWoolLots(documents), ...auditWoolPreparation(documents)]
}
