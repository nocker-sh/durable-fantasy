import type { z } from "zod"
import type { kitchenWaterCycleSchema } from "#/scripts/lib/kitchen-water-cycle-schema"
import type { residentDayPlanSchema } from "#/world/town/resident-day-plan-schema"
import type { dishwaterCaptureSchema } from "#/scripts/lib/dishwater-capture-schema"
type Plan = z.infer<typeof kitchenWaterCycleSchema>
type Props = Readonly<{ event: Plan["events"][number]; plan: Plan; day: z.infer<typeof residentDayPlanSchema>; roomId: string; capture: z.infer<typeof dishwaterCaptureSchema> }>
const activities = { meal_water: "prepare_food", dishwashing: "cleanup" }

/** Consumption reserves water before its task; refill becomes available only after the collection and local transfer finish. */
export function getKitchenWaterEventError(props: Props): Error | null {
  const event = props.event,
    task = props.day.segments.find((segment) => segment.from_min === event.task_from_min)
  if (!task || task.kind !== "stay" || task.place.kind !== "room" || task.place.room !== props.roomId) return new Error("Kitchen water event has no matching room task")
  if (event.kind === "use") {
    if (task.activity !== activities[event.purpose] || event.at_min !== task.from_min) return new Error("Kitchen water withdrawal does not precede its assigned task")
    if (event.purpose === "dishwashing" && event.volume_ml !== props.capture.wash_ml) return new Error("Kitchen withdrawal disagrees with retained dishwater")
    return null
  }
  const collection = props.day.segments.find((segment) => segment.from_min === event.collection_from_min)
  if (task.activity !== "water" || event.at_min !== task.to_min) return new Error("Kitchen refill is available before its transfer finishes")
  if (
    !collection ||
    collection.kind !== "stay" ||
    collection.activity !== "water" ||
    collection.place.kind !== "district" ||
    collection.place.symbol !== props.plan.source_district ||
    collection.to_min > task.from_min
  )
    return new Error("Kitchen refill has no preceding collection in its source district")

  return null
}
