import { waterStockPlanSchema } from "#/scripts/lib/water-stock-plan-schema"
import { waterVesselPickupSchema } from "#/scripts/lib/water-vessel-support-schema"
import { waterVesselGripSchema } from "#/scripts/lib/water-vessel-design-schema"
import { waterLandingSchema } from "#/scripts/lib/water-landing-schema"
import { z } from "zod"

/** A named collection plan is not a water-quality, carrying or daily-supply approval. */
export const potableWaterSupplySchema = z.object({
  status: z.literal("proposed"),
  source: z.string().min(1),
  carrier: z.string().min(1),
  container_symbol: z.string().length(1),
  container_id: z.string().min(1),
  stock_plan: waterStockPlanSchema,
  pickup_review: waterVesselPickupSchema.optional(),
  grip_review: waterVesselGripSchema.optional(),
  max_fill_l: z.number().positive(),
  pending: z.array(z.string().min(1)).min(1),
})
export const potableWaterCollectionSchema = z.object({
  purpose: z.literal("potable_supply"),
  status: z.literal("proposed"),
  landing: waterLandingSchema.optional(),
  pending: z.array(z.string().min(1)).min(1),
})
export const waterHandlingPlanSchema = z.object({ max_hand_load_kg: z.number().positive(), status: z.enum(["proposed", "designed"]), basis: z.string().min(1) })
