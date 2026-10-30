import { z } from "zod"
const positive = z.number().positive(),
  nonnegative = z.number().nonnegative(),
  text = z.string().min(1)
export const sparePillowCoverStorageSchema = z.object({
  scope: z.literal("nominal_spare_pillow_cover_on_cabinet_top"),
  status: z.literal("proposed"),
  id: text,
  source_pillow: text,
  source_cloth: text,
  size_m: z.tuple([positive, positive, positive]),
  position_m: z.tuple([nonnegative, z.literal(0), nonnegative]),
  protection: z.literal("wooden_box"),
  container: z.object({
    id: text,
    maker: text,
    timber_supplier: text,
    size_m: z.tuple([positive, positive, positive]),
    wall_m: positive,
    lid_m: positive,
    clearance_m: positive,
    opening: z.literal("north_hinge_to_vertical"),
  }),
  pending: z.array(text).min(1),
})
