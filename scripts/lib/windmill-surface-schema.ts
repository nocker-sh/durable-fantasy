import { z } from "zod"
export const windmillSurfaceSchema = z.object({
  status: z.literal("proposed"),
  scope: z.literal("road_profile_blend"),
  start: z.literal("west_edge_of_level_turn"),
  road: z.literal("preserve_existing_surface"),
  cross_grade_status: z.literal("unreviewed"),
  pending: z.array(z.string().trim().min(1)).min(1),
})
