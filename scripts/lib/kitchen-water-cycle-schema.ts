import { z } from "zod"
import { waterStockReceiveSchema, waterStockUseSchema } from "#/world/town/water-stock-cycle-schema"
import { rectangularLiquidVesselSchema } from "#/scripts/lib/rectangular-liquid-vessel-schema"
const text = z.string().min(1),
  minute = waterStockUseSchema.shape.at_min

/** This account covers meal water and dishwashing only; other household uses need their own assigned stock. */
export const kitchenWaterCycleSchema = z.object({
  scope: z.literal("meal_and_dishwater_cycle"),
  status: z.literal("proposed"),
  operator: text,
  fresh_symbol: z.string().length(1),
  source_district: z.string().length(1),
  source_operator: z.null(),
  vessel: rectangularLiquidVesselSchema,
  initial_ml: z.number().int().nonnegative().safe(),
  events: z
    .array(
      z.discriminatedUnion("kind", [
        waterStockReceiveSchema.extend({ task_from_min: minute, collection_from_min: minute }),
        waterStockUseSchema.extend({ task_from_min: minute, purpose: z.enum(["meal_water", "dishwashing"]) }),
      ]),
    )
    .min(1),
  pending: z.array(text).min(1),
})
