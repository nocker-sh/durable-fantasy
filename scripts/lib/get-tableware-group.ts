import { getDishDryingBatches } from "#/scripts/lib/get-dish-drying-batches"
import type { dishDryingSchema } from "#/scripts/lib/dish-drying-schema"
import type { z } from "zod"
type Plan = z.infer<typeof dishDryingSchema>

/** A meal names its complete service group; other services neither disappear from inventory nor become mandatory at that meal. */
export function getTablewareGroup(plan: Plan, group: string | null): readonly Plan["items"][number][] | Error {
  const batches = getDishDryingBatches(plan)
  if (batches instanceof Error) return batches
  if (!plan.batches && group === null) return plan.items
  const index = plan.batches?.groups.findIndex((batch) => batch.id === group) ?? -1
  if (index < 0) return new Error("Meal tableware has no named source group")

  return batches[index]
}
