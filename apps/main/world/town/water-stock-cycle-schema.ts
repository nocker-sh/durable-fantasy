import { z } from "zod"
import { RESIDENT_DAY_MINUTES } from "#/world/town/resident-day-plan-schema"
const millilitres = z.number().int().positive().safe(),
  minute = z.number().int().min(0).max(RESIDENT_DAY_MINUTES)
export const waterStockReceiveSchema = z.object({ kind: z.literal("receive"), at_min: minute, volume_ml: millilitres })
export const waterStockUseSchema = z.object({ kind: z.literal("use"), at_min: minute, volume_ml: millilitres })

/** Ordered reservations describe one cyclic stock account, without inventing measured supply or water quality. */
export const waterStockCycleSchema = z.object({
  initial_ml: z.number().int().nonnegative().safe(),
  capacity_ml: millilitres,
  events: z.array(z.discriminatedUnion("kind", [waterStockReceiveSchema, waterStockUseSchema])).min(1),
})
