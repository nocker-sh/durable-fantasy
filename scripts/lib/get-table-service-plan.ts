import { tablePlaceSettingsSchema } from "#/scripts/lib/table-place-settings-schema"
import { getPlaceSettingsError } from "#/scripts/lib/get-place-settings-error"
import { getTablewareInventory } from "#/scripts/lib/get-tableware-inventory"
import type { TableServiceKey } from "#/scripts/lib/table-service-keys"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { z } from "zod"
type Props = Readonly<{ room: SettingDocument; key: TableServiceKey; documents: ReadonlyMap<string, SettingDocument> }>

/** Validate the complete service's source and occupied layout before any native motion proof starts. */
export function getTableServicePlan(props: Props): z.infer<typeof tablePlaceSettingsSchema> | Error {
  const parsed = tablePlaceSettingsSchema.safeParse(props.room[props.key])
  if (!parsed.success || props.room.kind !== "rooms") return new Error("Invalid tabletop place settings")
  const inventory = getTablewareInventory(props.room, parsed.data, props.documents)
  if (inventory instanceof Error) return inventory
  if (props.key === "tea_place_settings" && inventory.items.some((item) => item.kind !== "cup")) return new Error("Tea service must use the complete cup group")
  const error = getPlaceSettingsError(props.room, parsed.data, props.documents)
  if (error) return error
  return parsed.data
}
