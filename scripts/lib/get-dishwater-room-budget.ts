import type { z } from "zod"
import type { dishwaterCaptureSchema } from "#/scripts/lib/dishwater-capture-schema"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import { getFurnitureLiquidCapacity } from "#/scripts/lib/get-furniture-liquid-capacity"
import { getDishwaterCaptureBudget } from "#/world/town/get-dishwater-capture-budget"
type Props = Readonly<{ room: SettingDocument; capture: z.infer<typeof dishwaterCaptureSchema> }>

/** Compute working capacity from the same authored cavities and furniture footprints. */
export function getDishwaterRoomBudget(props: Props) {
  const capture = props.capture
  const basin = getFurnitureLiquidCapacity({ room: props.room, symbol: capture.wash_symbol, role: "dish_washing", vessel: capture.basin })
  if (basin instanceof Error) return basin
  const receiver = getFurnitureLiquidCapacity({ room: props.room, symbol: capture.effluent_symbol, role: "kitchen_effluent_holding", vessel: capture.receiver })
  if (receiver instanceof Error) return receiver
  return getDishwaterCaptureBudget({
    washMl: capture.wash_ml,
    reservedBatches: capture.daily_batches,
    basinCapacityMl: basin.capacityMl,
    receiverCapacityMl: receiver.capacityMl,
    initialRetainedMl: capture.initial_effluent_ml,
  })
}
