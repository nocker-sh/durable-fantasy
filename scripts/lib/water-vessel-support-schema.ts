import { waterBackstepSchema } from "#/scripts/lib/water-backstep-schema"
import { z } from "zod"
const positive = z.number().positive()
export const waterVesselSupportSchema = z.object({
  status: z.literal("proposed"),
  kind: z.literal("wall_shelf"),
  wall: z.literal("w"),
  maker: z.string().min(1),
  origin_m: z.tuple([z.number().nonnegative(), z.number().nonnegative()]),
  size_m: z.tuple([positive, positive]),
  height_m: positive,
  thickness_m: positive,
  back_thickness_m: positive,
  back_height_m: positive,
  arm_width_m: positive,
  arm_thickness_m: positive,
  arm_inset_m: positive,
  front_setback_m: positive,
  vessel_at_m: z.tuple([positive, positive]),
  vessel_facing: z.literal("w"),
})
export const waterVesselPickupSchema = z.object({
  scope: z.literal("static_native_frames"),
  status: z.literal("unverified"),
  animations: z.tuple([z.literal("idle"), z.literal("look")]),
  body_m: z.tuple([z.number().nonnegative(), z.number().nonnegative()]),
  lift: z.object({ scope: z.literal("fixed_native_frames_vertical_lift"), status: z.literal("unverified"), rise_m: positive }).optional(),
  backstep: waterBackstepSchema.optional(),
  operation_space_index: z.number().int().nonnegative(),
  exclusive_with: z.array(z.string().regex(/^[A-Z]$/)).min(1),
})
