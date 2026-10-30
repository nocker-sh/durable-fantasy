import { z } from "zod"
const point = z.tuple([z.number(), z.number()])

/** Two shared nominal-circle operations define four reversible episodes; their waypoints are relative to the existing region anchors. */
export const stockLockOperationsSchema = z.object({
  status: z.literal("proposed"),
  scope: z.literal("caretaker_circle_gate_episodes"),
  push_poses: z.array(z.object({ angle_deg: z.number().min(0).max(90), body_m: point })).min(2),
  pull_arc: z.object({ orbit_radius_m: z.number().positive(), start_deg: z.number().min(0).max(90), end_deg: z.number().min(0).max(90), body_angle_mode: z.literal("clamp_leaf_angle") }),
  gate_paths: z
    .array(
      z.object({ gate: z.enum(["outer", "inner"]), push_approach_via_m: z.array(point), push_retreat_via_m: z.array(point), pull_approach_via_m: z.array(point), pull_retreat_via_m: z.array(point) }),
    )
    .length(2),
})
