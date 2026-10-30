import type { z } from "zod"
import type { kitchenWaterCycleSchema } from "#/scripts/lib/kitchen-water-cycle-schema"
import type { residentDayPlanSchema } from "#/world/town/resident-day-plan-schema"
import type { dishwaterCaptureSchema } from "#/scripts/lib/dishwater-capture-schema"
import { getKitchenWaterEventError } from "#/scripts/lib/get-kitchen-water-event-error"
type Props = Readonly<{ plan: z.infer<typeof kitchenWaterCycleSchema>; day: z.infer<typeof residentDayPlanSchema>; roomId: string; capture: z.infer<typeof dishwaterCaptureSchema> }>

/** Cover every local preparation, cleanup and refill exactly once, without crediting the same collection twice. */
export function getKitchenWaterBindingsError(props: Props): Error | null {
  const tasks = new Set<number>(),
    collections = new Set<number>()
  for (const event of props.plan.events) {
    const error = getKitchenWaterEventError({ ...props, event })
    if (error) return error
    if (tasks.has(event.task_from_min)) return new Error("Kitchen water task is reserved more than once")
    tasks.add(event.task_from_min)
    if (event.kind !== "receive") continue
    if (collections.has(event.collection_from_min)) return new Error("Kitchen refill credits the same collection more than once")
    collections.add(event.collection_from_min)
  }
  for (const segment of props.day.segments) {
    if (segment.kind !== "stay" || segment.place.kind !== "room" || segment.place.room !== props.roomId || !["prepare_food", "cleanup", "water"].includes(segment.activity)) continue
    if (!tasks.has(segment.from_min)) return new Error("Kitchen workday has an unreserved water task")
  }

  return null
}
