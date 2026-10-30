import type { dishDryingSchema } from "#/scripts/lib/dish-drying-schema"
import type { z } from "zod"
type Plan = z.infer<typeof dishDryingSchema>

/** Sequential groups require an empty rack between them; every object must occur once, without weakening same-group clearance. */
export function getDishDryingBatches(plan: Plan): readonly (readonly Plan["items"][number][])[] | Error {
  const byId = new Map(plan.items.map((item) => [item.id, item])),
    batches: Plan["items"][] = [],
    assigned = new Set<string>(),
    groups = new Set<string>()
  if (!plan.items.length || (plan.batches && !plan.batches.groups.length)) return new Error("Drying groups have no complete inventory")
  if (byId.size !== plan.items.length) return new Error("Drying inventory has duplicate object IDs")
  if (!plan.batches) return [plan.items]
  for (const group of plan.batches.groups) {
    if (groups.has(group.id) || !group.item_ids.length) return new Error("Invalid or repeated drying group")
    groups.add(group.id)
    const batch: Plan["items"] = []
    for (const id of group.item_ids) {
      const item = byId.get(id)
      if (!item || assigned.has(id)) return new Error("Drying group has an unknown or repeated object")
      assigned.add(id)
      batch.push(item)
    }
    batches.push(batch)
  }
  if (assigned.size !== plan.items.length) return new Error("Drying groups omit an inventory object")

  return batches
}
