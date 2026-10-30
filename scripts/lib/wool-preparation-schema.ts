import { z } from "zod"
import { rectangularLiquidVesselSchema } from "#/scripts/lib/rectangular-liquid-vessel-schema"
const text = z.string().min(1),
  positiveInteger = z.number().int().positive().safe(),
  symbol = z.string().length(1)
const coordinate = z.number().int().nonnegative().safe(),
  rectangle = z.tuple([coordinate, coordinate, positiveInteger, positiveInteger])
export const woolPreparationSchema = z.object({
  scope: z.literal("roofed_separate_wool_preparation_layout"),
  status: z.literal("proposed"),
  operator: text,
  raw_pool: text,
  water_source: text,
  stations: z.object({ raw: symbol, supply: symbol, wash: symbol, rinse: symbol, handwash: symbol, dry: symbol, prepare: symbol, clean: symbol, effluent: symbol }),
  zones: z.object({ dirty: rectangle, clean: rectangle }),
  vessels: z.object({
    supply: rectangularLiquidVesselSchema,
    wash: rectangularLiquidVesselSchema,
    rinse: rectangularLiquidVesselSchema,
    handwash: rectangularLiquidVesselSchema,
    effluent: rectangularLiquidVesselSchema,
  }),
  batch_raw_g: positiveInteger,
  water_budget: z.object({
    wash_ml: positiveInteger,
    rinse_ml: positiveInteger,
    rinse_changes: positiveInteger,
    handwash_ml: positiveInteger,
    supply_ml: positiveInteger,
    effluent_ml: positiveInteger,
    batches_before_service: positiveInteger,
  }),
  disposal: z.literal("retention_only_no_discharge"),
  final_disposal: z.null(),
  pending: z.array(text).min(1),
})
