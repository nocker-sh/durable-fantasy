import { z } from "zod"
const text = z.string().min(1),
  coordinate = z.number().int().nonnegative().safe(),
  dimension = z.number().int().positive().safe()

/** A local study reserves districts, not live buildings, households or an adopted connection to the gate. */
export const townDistrictPlanSchema = z.object({
  scope: z.literal("unplaced_district_study"),
  status: z.literal("proposed"),
  origin_m: z.null(),
  orientation: z.null(),
  entry_map: text,
  cell_m: z.number().positive(),
  rows: z.array(text).min(1),
  entrance: z.tuple([coordinate, coordinate]),
  districts: z
    .array(
      z.object({
        symbol: z.string().regex(/^[A-CE-Z]$/),
        role: z.enum(["work", "food", "housing", "fuel", "water", "care", "waste", "laundry", "trade", "dock", "lodging"]),
        title: text,
        purpose: text,
        rect: z.tuple([coordinate, coordinate, dimension, dimension]),
        access: z.tuple([coordinate, coordinate]),
        operator: z.null(),
        pending: z.array(text).min(1),
      }),
    )
    .min(1),
  pending: z.array(text).min(1),
})
