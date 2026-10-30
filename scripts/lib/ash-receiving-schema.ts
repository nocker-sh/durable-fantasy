import { z } from "zod"
const direction = z.enum(["forward", "backward", "side_left", "side_right"])
const carryStep = z.union([
  z.object({ direction, animation: z.literal("carry"), playback: z.enum(["forward", "reverse"]) }),
  z.object({ direction, animation: z.literal("side_step"), playback: z.null() }),
  z.object({ direction, animation: z.null(), playback: z.null() }),
])
export const ashReceivingSchema = z.object({
  method: z.literal("lift_transfer"),
  position_m: z.tuple([z.number().finite(), z.number().finite()]),
  status: z.literal("unverified"),
  grip_candidate: z.object({
    body_m: z.tuple([z.number().finite(), z.number().finite()]),
    facing: z.enum(["n", "s", "e", "w"]),
    poles: z.object({ l: z.tuple([z.number().finite(), z.number().finite(), z.number().finite()]), r: z.tuple([z.number().finite(), z.number().finite(), z.number().finite()]) }),
    status: z.literal("unverified"),
  }),
  transport_candidate: z.object({
    status: z.literal("unverified"),
    model: z.literal("fixed_pose_translation"),
    gait_review: z.object({
      animation: z.literal("carry"),
      scope: z.literal("rendered_phases"),
      status: z.literal("unverified"),
      side_step: z
        .object({
          scope: z.literal("sampled_poses"),
          stride_m: z.number().finite().positive(),
          lift_m: z.number().finite().positive(),
          pelvis_drop_m: z.number().finite().positive(),
          timing: z.object({
            min_cycle_s: z.number().finite().positive(),
            max_speed_m_s: z.number().finite().positive(),
            max_acceleration_m_s2: z.number().finite().positive(),
            status: z.literal("unverified"),
          }),
          status: z.literal("unverified"),
        })
        .nullable(),
      step_plan: z.array(carryStep).min(1),
    }),
    body_path_m: z.array(z.tuple([z.number().finite(), z.number().finite()])).min(2),
  }),
  approach: z.object({ state: z.literal("empty"), transition: z.literal("unverified"), poses: z.array(z.tuple([z.number().finite(), z.number().finite()])).min(2) }),
})
export type AshReceiving = z.infer<typeof ashReceivingSchema>
