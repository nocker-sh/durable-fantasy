import type { z } from "zod"
import type { dishwaterCaptureSchema } from "#/scripts/lib/dishwater-capture-schema"
import type { SettingDocument } from "#/scripts/lib/setting-document"
type Props = Readonly<{ room: SettingDocument; capture: z.infer<typeof dishwaterCaptureSchema> }>

/** Keep fresh storage, dirty washing, clean drying and retained effluent distinct. */
export function getDishwaterEquipmentError(props: Props): Error | null {
  const capture = props.capture
  if (
    new Set([capture.fresh_symbol, capture.wash_symbol, capture.dry_symbol, capture.effluent_symbol]).size !== 4 ||
    !props.room.furniture?.some((piece) => piece.symbol === capture.fresh_symbol && piece.role === "potable_water_storage")
  )
    return new Error("Dishwater capture mixes fresh water and dirty equipment")
  if (!props.room.furniture?.some((piece) => piece.symbol === capture.dry_symbol && piece.role === "dish_drying")) return new Error("Dishwater capture has no separate clean drying place")

  return null
}
