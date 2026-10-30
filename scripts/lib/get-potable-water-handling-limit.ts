import { getPotableWaterCollectionError } from "#/scripts/lib/get-potable-water-collection-error"
import { waterHandlingPlanSchema } from "#/scripts/lib/potable-water-supply-schema"
import type { potableWaterSupplySchema } from "#/scripts/lib/potable-water-supply-schema"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { z } from "zod"
type Props = { room: SettingDocument; documents: ReadonlyMap<string, SettingDocument>; supply: z.infer<typeof potableWaterSupplySchema> }

/** Bind the carrier to this home and this collection site before using an authored handling assumption. */
export function getPotableWaterHandlingLimit(props: Props): number | Error {
  const home = props.documents.get(String(props.room.building)),
    carrier = props.documents.get(props.supply.carrier),
    source = props.documents.get(props.supply.source)
  if (
    typeof props.room.town !== "string" ||
    home?.kind !== "buildings" ||
    carrier?.kind !== "residents" ||
    source?.kind !== "facilities" ||
    source.town !== props.room.town ||
    home.town !== props.room.town ||
    carrier.town !== props.room.town
  )
    return new Error("Water supply has no matching home, carrier or town facility")
  if (!Array.isArray(home.rooms) || !home.rooms.includes(props.room.id) || (Array.isArray(props.room.private_for) && !props.room.private_for.includes(carrier.id)))
    return new Error("Water carrier cannot use this household room")
  if (!Array.isArray(home.residents) || !home.residents.includes(carrier.id) || carrier.household !== home.household) return new Error("Water carrier does not belong to this household")
  if (!Array.isArray(home.facilities) || !home.facilities.includes(source.id) || !Array.isArray(source.users) || !source.users.includes(carrier.id))
    return new Error("Water collection site does not register this home and carrier")
  if (source.water_collection === undefined || getPotableWaterCollectionError(source)) return new Error("Water collection site is not a potable supply proposal")
  const handling = waterHandlingPlanSchema.safeParse(carrier.handling_plan)
  if (!handling.success) return new Error("Water carrier has no usable handling assumption")

  return handling.data.max_hand_load_kg
}
