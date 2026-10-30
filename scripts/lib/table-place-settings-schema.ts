import { z } from "zod"

const text = z.string().refine((value) => value.trim().length > 0)
const point = z.tuple([z.number(), z.number(), z.number()])
const withdrawal = z.object({
  scope: z.literal("fixed_native_frame_segment"),
  status: z.literal("unverified"),
  seat_target_m: point,
})
const restingArm = z.object({ seat_target_m: point, pole: point })
const reachReview = z
  .object({
    scope: z.literal("rendered_frames"),
    status: z.literal("unverified"),
    hand: z.enum(["l", "r"]),
    rest: z.object({ l: restingArm, r: restingArm }).optional(),
    pole: point,
    hover_above_m: z.number().positive(),
    withdrawal: withdrawal.optional(),
    elbow_swivel: z.object({ scope: z.literal("fixed_grip_pole_segment"), status: z.literal("unverified") }).optional(),
    advance: z.object({ scope: z.literal("fixed_native_frame_segments"), status: z.literal("unverified"), seat_target_m: point }).optional(),
    lift: z.object({ scope: z.literal("fixed_native_frame_segments"), status: z.literal("unverified"), seat_target_m: point, pole: point.optional() }).optional(),
  })
  .superRefine((review, context) => {
    if (review.advance && !review.lift) context.addIssue({ code: "custom", message: "Hand advance needs a lift" })
    if (review.lift && (!review.withdrawal || !review.elbow_swivel)) context.addIssue({ code: "custom", message: "Hand lift needs withdrawal and elbow swivel" })
    if (review.elbow_swivel && !review.withdrawal) context.addIssue({ code: "custom", message: "Elbow swivel needs a withdrawal endpoint" })
  })
const placedItem = z.object({
  id: text,
  orientation: z.enum(["upright", "flat"]),
  quarter_turns: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
  position_m: z.tuple([z.number().nonnegative(), z.number().nonnegative()]),
})

/** Tabletop positions refer to existing kitchen objects, never to a second copy of their dimensions. */
export const tablePlaceSettingsSchema = z.object({
  status: z.literal("proposed"),
  source_room: text,
  source_group: text.optional(),
  table: z.string().length(1),
  min_gap_m: z.number().positive(),
  places: z
    .array(
      z.object({
        resident: text,
        chair: z.string().length(1),
        reach_review: reachReview.optional(),
        items: z.array(placedItem).min(1),
      }),
    )
    .min(1),
  pending: z.array(text).min(1),
})
