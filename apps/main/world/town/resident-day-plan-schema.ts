import { z } from "zod"
export const RESIDENT_DAY_MINUTES = 24 * 60
const text = z.string().min(1),
  minute = z.number().int().min(0).max(RESIDENT_DAY_MINUTES)
export const residentDayPlaceSchema = z.discriminatedUnion("kind", [z.object({ kind: z.literal("room"), room: text }), z.object({ kind: z.literal("district"), symbol: z.string().length(1) })])
export const residentDayActivitySchema = z.enum(["sleep", "prepare_food", "meal", "cleanup", "hygiene", "water", "food_collection", "fuel_ash", "laundry", "clean", "work", "rest"])
const interval = z.object({ from_min: minute, to_min: minute, purpose: text })
export const residentDaySegmentSchema = z.discriminatedUnion("kind", [
  interval.extend({ kind: z.literal("stay"), activity: residentDayActivitySchema, place: residentDayPlaceSchema }),
  interval.extend({ kind: z.literal("travel"), from: residentDayPlaceSchema, to: residentDayPlaceSchema, room_route: z.array(text).min(1).optional() }),
])

/** Reserve proposed clock time without claiming that travel, work or supplies have been measured. */
export const residentDayPlanSchema = z.object({
  scope: z.literal("resident_workday_time_reservation"),
  status: z.literal("proposed"),
  clock: z.literal("jst_midnight_minutes"),
  segments: z.array(residentDaySegmentSchema).min(1),
  pending: z.array(text).min(1),
})
export type ResidentDayActivity = z.infer<typeof residentDayActivitySchema> | "travel"
