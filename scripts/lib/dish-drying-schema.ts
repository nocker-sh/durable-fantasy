import { cupSettingsSchema } from "#/scripts/lib/cup-settings-schema"
import { z } from "zod"

const text = z.string().refine((value) => value.trim().length > 0)
const positive = z.number().positive()
const position = z.tuple([z.number().nonnegative(), z.number().nonnegative()])
/** The same individually identified objects are placed on the drying grid and inside storage boxes. */
export const dishDryingSchema = z.object({
  status: z.literal("proposed"),
  support: z.string().length(1),
  washed_at: z.string().length(1),
  dry_storage: z.string().length(1),
  tray: z.object({ width_m: positive, depth_m: positive, wall_m: positive, height_m: positive, material: text }),
  grid: z.object({
    width_m: positive,
    depth_m: positive,
    frame_bottom_above_tray_floor_m: positive,
    bar_width_m: positive,
    gap_m: positive,
    frame_width_m: positive,
    frame_thickness_m: positive,
    foot_width_m: positive,
    min_support_margin_m: positive,
    material: text,
  }),
  min_air_gap_m: positive,
  batches: z.object({ mode: z.literal("sequential_empty_between"), groups: z.array(z.object({ id: text, item_ids: z.array(text).min(1) })).min(1) }).optional(),
  items: z
    .array(
      z
        .object({
          id: text,
          name: text,
          owner: text,
          source: text,
          kind: z.enum(["bowl", "spoon", "cup"]),
          width_m: positive,
          height_m: positive,
          depth_m: positive,
          cup: cupSettingsSchema.optional(),
          bowl: z.object({ base_diameter_m: positive, radial_wall_m: positive, bottom_m: positive }).optional(),
          drying_orientation: z.enum(["inverted", "flat"]),
          drying_position_m: position,
          storage: z.object({ box: text, support: z.literal("box_floor"), position_m: z.tuple([z.number().nonnegative(), z.number().nonnegative(), z.number().nonnegative()]) }),
        })
        .superRefine((item, context) => {
          if ((item.kind === "cup") !== (item.cup !== undefined)) context.addIssue({ code: "custom", message: "Cup dimensions need cup contents" })
          if ((item.kind === "bowl") !== (item.bowl !== undefined)) context.addIssue({ code: "custom", message: "Bowl dimensions need bowl contents" })
        }),
    )
    .min(1),
  pending: z.array(text).min(1),
})
