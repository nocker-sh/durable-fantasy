import { z } from "zod"
const positive = z.number().positive()
export const waterVesselDesignSchema = z.object({
  status: z.literal("proposed"),
  base_thickness_m: positive,
  lid_thickness_m: positive,
  knob_height_m: positive,
  knob_radius_m: positive,
  handles: z.object({ gap_m: positive, opening_height_m: positive, bar_radius_m: positive, centre_height_m: positive }),
})
export const waterVesselGripSchema = z.object({
  scope: z.literal("static_native_frames"),
  status: z.literal("unverified"),
  position_body_m: z.tuple([z.number(), z.number().positive(), z.number()]),
  poles: z.object({ l: z.tuple([z.number(), z.number(), z.number()]), r: z.tuple([z.number(), z.number(), z.number()]) }),
})
