import { z } from "zod"
import { rectangularLiquidVesselSchema } from "#/scripts/lib/rectangular-liquid-vessel-schema"
const text = z.string().min(1),
  symbol = z.string().length(1),
  positiveInteger = z.number().int().positive().safe()

/** One day's dishwashing reserves a dedicated receiver; an unknown disposal destination never becomes a drain. */
export const dishwaterCaptureSchema = z.object({
  scope: z.literal("one_day_dishwater_retention"),
  status: z.literal("proposed"),
  operator: text,
  fresh_symbol: symbol,
  wash_symbol: symbol,
  dry_symbol: symbol,
  effluent_symbol: symbol,
  wash_ml: positiveInteger,
  daily_batches: positiveInteger,
  initial_effluent_ml: z.number().int().nonnegative().safe(),
  basin: rectangularLiquidVesselSchema,
  receiver: rectangularLiquidVesselSchema,
  method: z.literal("manual_transfer_after_washing"),
  disposal: z.literal("retention_only_no_discharge"),
  final_disposal: z.null(),
  pending: z.array(text).min(1),
})
