import { personalStorageSchema } from "#/scripts/lib/personal-storage-schema"
import { getPersonalStoragePackingError } from "#/scripts/lib/get-personal-storage-packing-error"
import { getPersonalBoxHandlingError } from "#/scripts/lib/get-personal-box-handling-error"
import type { SettingDocument } from "#/scripts/lib/setting-document"

/** Missing measurements remain unmeasured; malformed or physically impossible authored packing is rejected. */
export function auditPersonalStoragePacking(room: SettingDocument, documents: ReadonlyMap<string, SettingDocument>): readonly string[] {
  if (room.personal_storage === undefined) return []
  const parsed = personalStorageSchema.safeParse(room.personal_storage)
  if (!parsed.success) return ["personal-storage-packing: Invalid personal storage proposal"]
  const errors: string[] = []
  for (const slot of parsed.data) {
    if (slot.packing && parsed.data.filter((other) => other.furniture_symbol === slot.furniture_symbol).length !== 1) {
      errors.push(`${slot.id}: Packing needs a dedicated physical box`)
      continue
    }
    const error = getPersonalStoragePackingError({ room, slot, documents })
    if (error) {
      errors.push(`${slot.id}: ${error.message}`)
      continue
    }
    if (slot.packing?.opening) {
      const handling = getPersonalBoxHandlingError({ room, slot, building: documents.get(String(room.building)) })
      if (handling) errors.push(`${slot.id}: ${handling.message}`)
    }
  }

  return errors
}
