import { dishDryingSchema } from "#/scripts/lib/dish-drying-schema"
import { getDishDryingError } from "#/scripts/lib/get-dish-drying-error"
import { getDishStorageError } from "#/scripts/lib/get-dish-storage-error"
import type { SettingDocument } from "#/scripts/lib/setting-document"

/** A proposed drying station must use the same dishes and utensils in drying and storage. */
export function auditDishDrying(room: SettingDocument): readonly string[] {
  if (room.dish_drying === undefined) return []
  const parsed = dishDryingSchema.safeParse(room.dish_drying)
  if (!parsed.success || room.kind !== "rooms") return [`${room.id}: Invalid dish drying plan`]
  const errors = [getDishDryingError(room, parsed.data), getDishStorageError(room, parsed.data)]
  const messages = errors.filter((error): error is Error => error instanceof Error).map((error) => `${room.id}: ${error.message}`)

  if (room.design_gate === "通過") return [...messages, `${room.id}: Dish drying operation remains proposed`]

  return messages
}
