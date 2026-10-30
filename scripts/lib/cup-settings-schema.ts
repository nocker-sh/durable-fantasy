import { z } from "zod"
const positive = z.number().positive()
export const cupSettingsSchema = z.object({
  body_diameter_m: positive,
  base_diameter_m: positive,
  radial_wall_m: positive,
  bottom_m: positive,
  handle_gap_m: positive,
  handle_radius_m: positive,
  handle_bottom_m: positive,
  handle_top_m: positive,
})
