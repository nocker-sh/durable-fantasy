import { TABLE_SERVICE_KEYS } from "#/scripts/lib/table-service-keys"
import { tablePlaceSettingsSchema } from "#/scripts/lib/table-place-settings-schema"
import type { SettingDocument } from "#/scripts/lib/setting-document"

/** Every proposed service keeps its kitchen and diners in the household's design gate. */
export function getTableServicePrerequisites(document: SettingDocument): readonly string[] {
  return TABLE_SERVICE_KEYS.flatMap((key) => {
    const parsed = tablePlaceSettingsSchema.safeParse(document[key])
    if (!parsed.success) return []
    return [parsed.data.source_room, ...parsed.data.places.map((place) => place.resident)].filter((id) => id !== document.id)
  })
}
