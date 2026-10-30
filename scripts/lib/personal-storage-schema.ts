import { z } from "zod"
import { frontAccessStorageSchema } from "#/scripts/lib/front-access-storage-schema"
const text = z.string().min(1),
  positive = z.number().positive(),
  nonnegative = z.number().nonnegative()
export const personalStoragePackingSchema = z.object({
  scope: z.literal("closed_box_floor_layout"),
  status: z.literal("proposed"),
  maker: text,
  timber_supplier: text,
  height_m: positive,
  wall_m: positive,
  lid_m: positive,
  clearance_m: positive,
  front_access: frontAccessStorageSchema.optional(),
  lid_handle: z.object({ id: text, axis: z.enum(["x", "z"]), span_m: positive, depth_m: positive, height_m: positive, thickness_m: positive, offset_m: z.tuple([z.number(), z.number()]) }).optional(),
  objects: z
    .array(
      z.object({
        id: text,
        kind: z.enum(["clothing", "scarf", "personal_effects"]),
        description: text,
        source: text,
        position_m: z.tuple([nonnegative, nonnegative, nonnegative]),
        size_m: z.tuple([positive, positive, positive]),
      }),
    )
    .length(3),
  opening: z
    .object({
      scope: z.literal("lid_translation_only"),
      status: z.literal("proposed"),
      lift_m: positive,
      rest_center_m: z.tuple([nonnegative, nonnegative, nonnegative]),
      rest_support: text.nullable().optional(),
      pending: z.array(text).min(1),
      reach_review: z
        .object({
          scope: z.literal("native_static_endpoints_only"),
          status: z.literal("unresolved"),
          operator: text,
          animation: z.literal("scrub"),
          frame: z.number().int().nonnegative(),
          body_from_lid_m: z.tuple([z.number(), z.number()]),
          target: z.enum(["west_edge", "lid_handle"]).optional(),
          grip_review: z
            .object({
              scope: z.literal("static_whole_bridge_palm_contact"),
              status: z.literal("proposed"),
              elbow_poles: z.object({ l: z.tuple([z.number(), z.number(), z.number()]), r: z.tuple([z.number(), z.number(), z.number()]) }),
              pending: z.array(text).min(1),
              motion_review: z
                .object({
                  scope: z.literal("vertical_lid_external_intervals"),
                  status: z.literal("proposed"),
                  samples_per_phase: z.number().int().min(2).max(128),
                  pending: z.array(text).min(1),
                  lateral_review: z
                    .object({
                      scope: z.literal("native_low_side_step_samples"),
                      status: z.literal("proposed"),
                      cycles: z.number().int().min(1).max(16),
                      leading_foot: z.literal("r"),
                      foot_lift_m: positive,
                      pelvis_rise_m: positive,
                      pending: z.array(text).min(1),
                    })
                    .optional(),
                })
                .optional(),
            })
            .optional(),
          hand_half_span_m: positive,
          pelvis_drop_m: positive,
          knee: z.enum(["l", "r"]),
          pending: z.array(text).min(1),
        })
        .optional(),
    })
    .optional(),
  pending: z.array(text).min(1),
})
export const personalStorageSchema = z.array(
  z.object({
    id: text,
    resident: text,
    contents: z.array(text),
    furniture_symbol: text.nullable().optional(),
    compartment: text,
    packing: personalStoragePackingSchema.optional(),
  }),
)
