import { sparePillowCoverStorageSchema } from "#/scripts/lib/spare-pillow-cover-storage-schema"
import { z } from "zod"
import { spareBlanketStorageSchema } from "#/scripts/lib/spare-blanket-storage-schema"
const positive = z.number().positive(),
  nonnegative = z.number().nonnegative()
export const frontAccessStorageSchema = z.object({
  scope: z.literal("west_sliding_cabinet_alternative"),
  status: z.literal("proposed"),
  replaces_symbols: z.tuple([z.literal("C"), z.literal("R")]),
  rect: z.tuple([nonnegative.int(), nonnegative.int(), positive.int(), positive.int()]),
  grid_rows: z.array(z.string().min(1)).min(1),
  use_space: z.tuple([nonnegative.int(), nonnegative.int(), positive.int(), positive.int()]),
  storage_floor_m: positive,
  top_m: positive,
  board_m: positive,
  leg_width_m: positive,
  panel_m: positive,
  guide_m: positive,
  overlap_m: positive,
  rear_travel_m: positive,
  pull: z.object({ bottom_m: positive, height_m: positive, width_m: positive, from_meeting_m: positive, south_from_meeting_m: positive, south_width_m: positive }),
  objects: z.array(z.object({ id: z.string().min(1), position_m: z.tuple([nonnegative, nonnegative, nonnegative]), size_m: z.tuple([positive, positive, positive]) })).length(3),
  pending: z.array(z.string().min(1)).min(1),
  spare_blanket: spareBlanketStorageSchema.optional(),
  spare_pillow_cover: sparePillowCoverStorageSchema.optional(),
  approach_review: z
    .object({
      scope: z.literal("native_standing_one_hand_approach_samples"),
      status: z.literal("proposed"),
      operator: z.string().min(1),
      animation: z.literal("idle"),
      frame: nonnegative.int(),
      hand: z.enum(["l", "r"]),
      body_from_pull_m: z.tuple([z.number(), z.number()]),
      target_clearance_m: positive,
      elbow_pole: z.tuple([z.number(), z.number(), z.number()]),
      samples: z.number().int().min(2).max(128),
      pending: z.array(z.string().min(1)).min(1),
    })
    .optional(),
  handle_review: z
    .object({
      scope: z.literal("native_single_hand_raised_handle_samples"),
      status: z.literal("proposed"),
      panel_kind: z.literal("solid_wood"),
      operator: z.string().min(1),
      animation: z.literal("idle"),
      frame: nonnegative.int(),
      hand: z.enum(["l", "r"]),
      body_from_bar_m: z.tuple([z.number(), z.number()]),
      elbow_pole: z.tuple([z.number(), z.number(), z.number()]),
      samples: z.number().int().min(2).max(128),
      pending: z.array(z.string().min(1)).min(1),
      standing_support: z.object({ scope: z.literal("native_grounded_feet"), pelvis_drop_m: positive }),
      step_review: z
        .object({
          scope: z.literal("native_standing_side_step_samples"),
          status: z.literal("proposed"),
          cycles: z.number().int().min(1).max(16),
          foot_lift_m: positive,
          samples_per_cycle: z.number().int().min(2).max(128),
          pending: z.array(z.string().min(1)).min(1),
          reach_review: z.object({ scope: z.literal("native_leg_reach_intervals"), status: z.literal("proposed"), pending: z.array(z.string().min(1)).min(1) }).optional(),
          leg_clearance_review: z.object({ scope: z.literal("native_leg_external_intervals"), status: z.literal("proposed"), pending: z.array(z.string().min(1)).min(1) }).optional(),
          upper_clearance_review: z.object({ scope: z.literal("native_rigid_upper_external_intervals"), status: z.literal("proposed"), pending: z.array(z.string().min(1)).min(1) }).optional(),
          forearm_self_review: z.object({ scope: z.literal("native_rigid_forearm_self_intervals"), status: z.literal("proposed"), pending: z.array(z.string().min(1)).min(1) }).optional(),
        })
        .optional(),
      handle: z.object({
        north_travel_m: positive,
        north_id: z.string().min(1),
        south_id: z.string().min(1),
        north_from_meeting_m: positive,
        south_from_meeting_m: positive,
        centre_y_m: positive,
        height_m: positive,
        stand_off_m: positive,
        thickness_m: positive,
      }),
    })
    .optional(),
})
