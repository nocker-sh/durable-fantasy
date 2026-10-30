import { dishwaterCaptureSchema } from "#/scripts/lib/dishwater-capture-schema"
import { getDishwaterOperatorError } from "#/scripts/lib/get-dishwater-operator-error"
import { getDishwaterEquipmentError } from "#/scripts/lib/get-dishwater-equipment-error"
import { getDishwaterRoomBudget } from "#/scripts/lib/get-dishwater-room-budget"
import type { SettingDocument } from "#/scripts/lib/setting-document"
type Props = Readonly<{ room: SettingDocument; documents: ReadonlyMap<string, SettingDocument> }>

/** Only finite local retention is checked; fresh supply, disposal and the actual washing and transfer motion remain pending. */
export function getDishwaterCaptureError(props: Props): Error | null {
  if (props.room.dishwater_capture === undefined) return null
  const parsed = dishwaterCaptureSchema.safeParse(props.room.dishwater_capture)
  if (!parsed.success || props.room.kind !== "rooms") return new Error("Invalid dishwater capture proposal")
  const capture = parsed.data
  const access = getDishwaterOperatorError({ ...props, capture })
  if (access) return access
  if (props.room.design_gate === "通過") return new Error("Proposed dishwater retention cannot clear the design gate")
  const equipment = getDishwaterEquipmentError({ room: props.room, capture })
  if (equipment) return equipment
  const budget = getDishwaterRoomBudget({ room: props.room, capture })
  if (budget instanceof Error) return budget

  return null
}
