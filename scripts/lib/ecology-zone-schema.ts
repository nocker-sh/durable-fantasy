import { z } from "zod"
const cell = z.tuple([z.number().int().nonnegative(), z.number().int().nonnegative()])
export const ecologySiteSchema = z.object({
  id: z.string().min(1),
  grid: z.object({ origin_tiles: z.tuple([z.number().finite(), z.number().finite()]), cell_tiles: z.number().finite().positive(), rows: z.array(z.string().min(1)).min(1) }),
  features: z
    .array(
      z.object({
        id: z.string().min(1),
        symbol: z.string().regex(/^[A-Z]$/),
        role: z.enum(["food", "water", "rest", "escape"]),
        rect: z.tuple([z.number().int().nonnegative(), z.number().int().nonnegative(), z.number().int().positive(), z.number().int().positive()]),
        access: z.array(cell).min(1),
        surface: z.literal("walkable_ground"),
        source: z.string().min(1),
        management: z.string().min(1),
      }),
    )
    .min(4),
  hydrology: z.object({ supply: z.string().min(1), loss: z.string().min(1), dry_period: z.string().min(1), ash: z.string().min(1) }),
  pending: z.array(z.string().min(1)).min(1),
})
export const ecologyPlacementSchema = z.object({ status: z.literal("proposed"), sites: z.array(ecologySiteSchema).min(1) })
export const ecologyZoneSchema = z.object({ species: z.string().startsWith("monster-"), feature: z.string().min(1), placement: ecologyPlacementSchema.nullable() })
export const ecologyZonesSchema = z.array(ecologyZoneSchema)
export type EcologyPlacement = z.infer<typeof ecologyPlacementSchema>
export type EcologySite = z.infer<typeof ecologySiteSchema>
export type EcologyFeature = EcologySite["features"][number]
