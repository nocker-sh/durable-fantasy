import { getTablewareGroup } from "#/scripts/lib/get-tableware-group"
import { householdMealSchema } from "#/scripts/lib/household-meal-schema"
import { dishDryingSchema } from "#/scripts/lib/dish-drying-schema"
import type { tablePlaceSettingsSchema } from "#/scripts/lib/table-place-settings-schema"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { z } from "zod"
type Plan = z.infer<typeof tablePlaceSettingsSchema>

/** Resolve one household's actual kitchen inventory and the same room's named dining seats. */
export function getTablewareInventory(room: SettingDocument, plan: Plan, documents: ReadonlyMap<string, SettingDocument>) {
  const kitchen = documents.get(plan.source_room)
  if (kitchen?.kind !== "rooms" || kitchen.building !== room.building) return new Error("Meal tableware source is outside this home")
  const source = dishDryingSchema.safeParse(kitchen.dish_drying)
  if (!source.success) return new Error("Meal tableware source is unavailable")
  if (new Set(source.data.items.map((item) => item.id)).size !== source.data.items.length) return new Error("Meal tableware source has duplicate object IDs")
  const meal = householdMealSchema.safeParse(room.household_meal)
  if (!meal.success || meal.data.table !== plan.table) return new Error("Tabletop settings do not use the household dining surface")

  const items = getTablewareGroup(source.data, plan.source_group ?? null)
  if (items instanceof Error) return items

  return { items, meal: meal.data }
}
